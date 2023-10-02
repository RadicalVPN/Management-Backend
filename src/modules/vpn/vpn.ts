import { WireguardParser } from "../../WireguardParser"
import { db } from "../../database"
import { NodeFactory } from "../nodes/node-factory"
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
}

export class VPN {
    constructor(readonly data: VPNdata) {}

    async generateClientConfig(): Promise<string> {
        const node = await this.getAssociatedNode()

        if (!node) {
            return ""
        }

        return [
            "[Interface]",
            `PrivateKey = ${this.data.priv}`,
            `Address = ${this.data.ipv4}/32, ${this.data.ipv6}/128`,
            "DNS = 1.1.1.1, 1.0.0.1",
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
        const status = await this.parseCliData()

        return {
            id: this.data.id,
            active: this.data.active == 1,
            alias: this.data.alias,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
            node: this.data.nodeId,
            status: {
                allowedIps: status?.allowedIps || [],
                latestHandshakeAt: status?.latestHandshakeAt || "N/A",
                transfer: {
                    rx: status?.transferRx || 0,
                    tx: status?.transferTx || 0,
                },
                persistentKeepalive: status?.persistentKeepalive || "N/A",
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

    async parseCliData() {
        const wireguardStatus = await WireguardParser.getStats(
            await this.getAssociatedNode(),
        )

        return wireguardStatus.filter(
            (vpn) => vpn.publicKey === this.data.pub,
        )[0]
    }

    private async getAssociatedNode() {
        return await new NodeFactory().get(this.data.nodeId)
    }
}
