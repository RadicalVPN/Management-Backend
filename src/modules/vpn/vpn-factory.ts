import { db } from "../../database"
import { exec } from "../../util"
import { DHCP, DhcpIpType } from "../DHCP"
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

    async getAll() {
        const data = await db
            .table("vpns")
            .select("*")
            .where("userId", this.userData.id)

        return data.map((_data) => new VPN(_data))
    }

    async get(id: string) {
        const data = (
            await db
                .table("vpns")
                .select("*")
                .where("userId", this.userData.id)
                .where("id", id)
        )?.[0]

        return data ? new VPN(data) : undefined
    }

    async delete(id: string) {
        return (
            await db
                .table("vpns")
                .delete("*")
                .where("userId", this.userData.id)
                .where("id", id)
        )?.[0]
    }

    async add(alias: string) {
        const ipv4 = await new DHCP(DhcpIpType.V4).pop()
        const ipv6 = await new DHCP(DhcpIpType.V6).pop()
        const privateKey = await exec("wg genkey")
        const publicKey = await exec(`echo ${privateKey} | wg pubkey`)
        const presharedKey = await exec("wg genpsk")

        await db.table("vpns").insert({
            alias,
            ipv4,
            ipv6,
            pub: publicKey,
            priv: privateKey,
            psk: presharedKey,
            userId: this.userData.id,
            active: 1,
        })

        await ConfigManager.publishServerConfig()
    }
}
