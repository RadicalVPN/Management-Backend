import { db } from "../../database"
import { NodeFactory } from "../nodes/node-factory"
import { Redis } from "../redis"
import { ConfigManager } from "../server/config-manager"

export interface VPNdata {
    id: number
    alias: string
    ipv4: string
    ipv6: string
    pub: string
    priv: string
    psk: string
    userId: number
    active: number
    createdAt: string
    updatedAt: string
    nodeId: string
    dynamic: boolean
}

export class VPN {
    constructor(readonly data: VPNdata) {}

    async generateClientConfig(dns?: string): Promise<string> {
        const node = await this.getAssociatedNode()

        if (!node) {
            return ""
        }

        return [
            "[Interface]",
            `PrivateKey = ${this.data.priv}`,
            `Address = ${this.data.ipv4}/32, ${this.data.ipv6}/128`,
            `DNS = ${dns || "1.1.1.1"}`,
            "",
            "[Peer]",
            `PublicKey = ${node.data.public_key}`,
            `PresharedKey = ${this.data.psk}`,
            `AllowedIPs = 0.0.0.0/0, ::/0`,
            `PersistentKeepalive = 25`,
            `Endpoint = ${node.data.external_ip}:51820`,
        ].join("\n")
    }

    async getInfo() {
        const liveData = await this.getLiveDataFromRedis()

        return {
            id: this.data.id,
            active: this.data.active == 1,
            alias: this.data.alias,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
            node: this.data.nodeId,
            status: {
                allowedIps: liveData?.allowedIps || [],
                latestHandshakeAt: liveData?.latestHandshakeAt || "N/A",
                transfer: {
                    rx: liveData?.transferRx || 0,
                    tx: liveData?.transferTx || 0,
                },
                current: {
                    rx: liveData?.rx || 0,
                    tx: liveData?.tx || 0,
                },
                persistentKeepalive: liveData?.persistentKeepalive || "N/A",
                connected: liveData?.connected || false,
            },
        }
    }

    async toggle() {
        await db
            .table("vpns")
            .update({ active: this.data.active == 1 ? 0 : 1 })
            .where("id", this.data.id)
            .where("userId", this.data.userId)

        const node = await new NodeFactory().get(this.data.nodeId)
        if (!node) {
            return console.error(`vpn node ${this.data.nodeId} is invalid.`)
        }

        await ConfigManager.publishServerConfig(node.data.id)
    }

    async getLiveDataFromRedis() {
        const node = await this.getAssociatedNode()
        const redis = await Redis.getInstance()

        return (
            (await redis.json.get(`vpn_stats:${node?.data.hostname}`, {
                path: `$.['${this.data.pub}']`,
            })) as any
        )?.[0]
    }

    /**
     * Deletes the private key from the database to improve security.
     */
    async deletePrivateKey() {
        await db
            .table("vpns")
            .update({ priv: null })
            .where("id", this.data.id)
            .where("userId", this.data.userId)
    }

    private async getAssociatedNode() {
        return await new NodeFactory().get(this.data.nodeId)
    }
}
