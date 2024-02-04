import { Redis } from "./modules/redis"

export class WireguardParser {
    static async getStats(): Promise<any> {
        //ask every vpn node, used in metrics
        const redis = await Redis.getInstance()

        const vpnStatKeys = []
        for await (const key of redis.scanIterator({
            MATCH: "vpn_stats:*",
            COUNT: 1000,
        })) {
            vpnStatKeys.push(key)
        }

        if (vpnStatKeys.length === 0) {
            return []
        }

        const data = await redis.json.mGet(vpnStatKeys, "$[*]")

        //@ts-ignore
        return [].concat(...data)
    }
}
