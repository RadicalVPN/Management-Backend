import { db } from "../../database"
import { exec } from "../../util"
import { DHCP, DhcpIpType } from "../DHCP"
import { Node } from "../nodes/node"
import { ConfigManager } from "../server/config-manager"
import { User, UserData } from "../user/user"
import { VPN } from "./vpn"

export class VPNFactory extends User {
    constructor(user: UserData) {
        super(user)
    }

    static async getFromAllUsers() {
        return await db.table("vpns").select("*").where("active", 1)
    }

    static async getForNode(node: string) {
        return await db
            .table("vpns")
            .select("*")
            .where("active", 1)
            .where("nodeId", node)
    }

    static async globalGetAllRaw() {
        return await db.table("vpns").select("*")
    }

    async getAll(includeDynamic = false) {
        const data = (await db
            .table("vpns")
            .select("*")
            .where("userId", this.userData.id)
            .modify(async (queryBuilder) => {
                if (!includeDynamic) {
                    await queryBuilder.where("dynamic", false)
                }
            })) as any[]

        return data.map((_data) => new VPN(_data))
    }

    async getAllDynamic() {
        const data = await db
            .table("vpns")
            .select("*")
            .orderBy("createdAt")
            .where("userId", this.userData.id)
            .where("dynamic", true)

        return data.map((_data) => new VPN(_data))
    }

    async get(id: string, includeDynamic = false) {
        const data = (
            await db
                .table("vpns")
                .select("*")
                .where("userId", this.userData.id)
                .where("id", id)
                .modify(async (queryBuilder) => {
                    if (!includeDynamic) {
                        await queryBuilder.where("dynamic", false)
                    }
                })
        )?.[0]

        return data ? new VPN(data) : undefined
    }

    async delete(id: string) {
        const vpn = await this.get(id)
        if (!vpn) {
            return
        }

        await db
            .table("vpns")
            .del()
            .where("userId", this.userData.id)
            .where("id", id)
            .where("dynamic", false)

        //only publish if this isn't a legacy vpn
        const nodeId = vpn.data.nodeId
        if (nodeId) {
            await ConfigManager.publishServerConfig(nodeId.toString())
        }
    }

    async deleteMultipleVpns(vpns: VPN[]): Promise<number> {
        const vpnIds = vpns.map((vpn) => vpn.data.id)

        const delCnt = await db
            .table("vpns")
            .del()
            .where("userId", this.userData.id)
            .whereIn("id", vpnIds)

        const nodesToPublish = Array.from(
            vpns.reduce((acc, vpn) => {
                const nodeId = vpn.data.nodeId
                if (nodeId) {
                    acc.add(nodeId)
                }

                return acc
            }, new Set<string>()),
        )
        nodesToPublish.forEach((nodeId) => {
            //we don't need await here, because this doesn't need to be async
            //eslint-disable-next-line @typescript-eslint/no-floating-promises
            ConfigManager.publishServerConfig(nodeId)
        })

        return delCnt
    }

    async add(alias: string, node: Node, dynamic = false) {
        const ipv4 = await new DHCP(DhcpIpType.V4, node.data.hostname).pop()
        const ipv6 = await new DHCP(DhcpIpType.V6, node.data.hostname).pop()
        const privateKey = await exec("wg genkey", false)
        const publicKey = await exec(`echo ${privateKey} | wg pubkey`, false)
        const presharedKey = await exec("wg genpsk", false)

        const newVpnId = await db
            .table("vpns")
            .insert({
                alias,
                ipv4,
                ipv6,
                pub: publicKey,
                priv: privateKey,
                psk: presharedKey,
                userId: this.userData.id,
                active: 1,
                nodeId: node.data.id,
                dynamic: dynamic,
            })
            .returning("id")

        await ConfigManager.publishServerConfig(node.data.id)

        return newVpnId[0].id
    }
}
