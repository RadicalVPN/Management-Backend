import { config as Config } from "../../config"

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
            "",
            "[Peer]",
            `PublicKey = ${Config.VPN.SECRETS.PUBLIC_KEY}`,
            `PresharedKey = ${this.data.psk}`,
            `AllowedIPs = 0.0.0.0/0, ::/0`,
            `PersistentKeepalive = 25`,
            "Endpoint = 127.0.0.1:51820",
        ].join("\n")
    }
}
