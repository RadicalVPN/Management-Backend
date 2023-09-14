import { exec } from "./util"

export class WireguardParser {
    static async getStats() {
        const rawStats = await exec("wg show wg0 dump")

        return rawStats.trim().split("\n").slice(1).map(this.parseVpnStatusLine)
    }

    private static parseVpnStatusLine(line: string) {
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
