import { WireguardParser } from "../../WireguardParser"
import { config as Config } from "../../config"
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
    nodeId: number
}

export class VPN {
    constructor(readonly data: VPNdata) {}

    generateClientConfig() {
        return [
            "[Interface]",
            `PrivateKey = ${this.data.priv}`,
            `Address = ${this.data.ipv4}/32, ${this.data.ipv6}/128`,
            "DNS = 1.1.1.1, 1.0.0.1",
            "",
            "[Peer]",
            `PublicKey = ${Config.VPN.SECRETS.PUBLIC_KEY}`,
            `PresharedKey = ${this.data.psk}`,
            `AllowedIPs = 0.0.0.0/0, ::/0`,
            `PersistentKeepalive = 25`,
            `Endpoint = ${Config.VPN.ENDPOINT_IP}:51820`,
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

        await ConfigManager.publishServerConfig(node.hostname)
    }

    async parseCliData() {
        const wireguardStatus = await WireguardParser.getStats()

        return wireguardStatus.filter(
            (vpn) => vpn.publicKey === this.data.pub,
        )[0]
    }
}
