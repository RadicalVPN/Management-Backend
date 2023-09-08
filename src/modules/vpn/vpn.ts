import { config as Config } from "../../config"
import { db } from "../../database"
import { exec } from "../../util"

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
                allowedIps: status.allowedIps,
                latestHandshakeAt: status.latestHandshakeAt,
                transfer: {
                    rx: status.transferRx,
                    tx: status.transferTx,
                },
                persistentKeepalive: status.persistentKeepalive,
            },
        }
    }

    async toggle() {
        await db
            .table("vpns")
            .update({ active: this.data.active == 1 ? 0 : 1 })
            .where("id", this.data.id)
            .where("userId", this.data.userId)
    }

    async parseCliData() {
        const wireguardStatus = await exec("wg show wg0 dump")

        return wireguardStatus
            .trim()
            .split("\n")
            .slice(1)
            .map(this.parseVpnStatusLine)
            .filter((vpn) => vpn.publicKey === this.data.pub)[0]
    }

    private parseVpnStatusLine(line: string) {
        const [
            publicKey,
            preSharedKey,
            endpoint,
            allowedIps,
            latestHandshakeAt,
            transferRx,
            transferTx,
            persistentKeepalive,
        ] = line.split("\t")

        return {
            publicKey,
            preSharedKey,
            endpoint,
            allowedIps: allowedIps.split(","),
            latestHandshakeAt:
                latestHandshakeAt === "0"
                    ? null
                    : new Date(`${parseInt(latestHandshakeAt)}000`),
            transferRx: parseInt(transferRx),
            transferTx: parseInt(transferTx),
            persistentKeepalive,
        }
    }
}
