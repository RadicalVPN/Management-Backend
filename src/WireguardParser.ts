import axios from "axios"
import { NodeFactory, VpnNode } from "./modules/nodes/node-factory"

export class WireguardParser {
    static async getStats(node?: VpnNode) {
        //ask every vpn node, used in metrics
        if (!node) {
            const nodes = await new NodeFactory().getAll()
            const rawMetrics = await Promise.all(
                nodes.map(async (node) => await this.getMetricsFromNode(node)),
            )

            return rawMetrics
                .map((stats) => this.parseRawStats(stats))
                .reduce(
                    (arr, item) => {
                        arr.push(...item)
                        return arr
                    },
                    [] as ReturnType<typeof this.parseRawStats>,
                )
        } else {
            return this.parseRawStats(await this.getMetricsFromNode(node))
        }
    }

    private static async getMetricsFromNode(node: VpnNode) {
        return (await axios.get(`http://${node.internal_ip}:8080/metrics`))
            .data as string
    }

    private static parseRawStats(rawStats: string) {
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
