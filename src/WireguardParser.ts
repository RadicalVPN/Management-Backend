import { Redis } from "./modules/Redis"

export class WireguardParser {
    static async getStats() {
        //ask every vpn node, used in metrics
        const redis = await Redis.getInstance()

        let vpnStats = []
        for await (const key of redis.scanIterator({
            MATCH: "vpn_stats:*",
            COUNT: 100,
        })) {
            const data = await redis.get(key)

            if (data) {
                vpnStats.push(JSON.parse(data))
            }
        }

        return vpnStats
    }
}
