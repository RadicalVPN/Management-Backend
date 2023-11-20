import { Redis } from "./modules/Redis"

export class WireguardParser {
    static async getStats(): Promise<any> {
        //ask every vpn node, used in metrics
        const redis = await Redis.getInstance()

        const vpnStatKeys = []
        for await (const key of redis.scanIterator({
            MATCH: "vpn_stats:*",
            COUNT: 100,
        })) {
            vpnStatKeys.push(key)
        }

        const data = await redis.json.mGet(vpnStatKeys, "$[*]")

        //@ts-ignore
        return [].concat(...data)
    }
}
