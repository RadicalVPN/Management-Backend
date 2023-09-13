import express, { Express } from "express"
import { WireguardParser } from "./WireguardParser"
import { VPNFactory } from "./modules/vpn/vpn-factory"

interface IVPNStat {
    rx: number
    tx: number
}

interface IRawVPNHashMap {
    [userId: string]: IVPNStat[]
}

interface IVPNHashMap {
    [userId: string]: IVPNStat
}

export class Metrics {
    private app: Express

    constructor() {
        this.app = express()
        this.registerRoutes()
    }

    private async getUserVpnHashMap(): Promise<IRawVPNHashMap> {
        const stats = await WireguardParser.getStats()
        const vpns = await VPNFactory.globalGetAllRaw()

        return vpns.reduce((hash, cur) => {
            if (!hash[cur.userId]) {
                hash[cur.userId] = []
            }

            const vpn = stats.find((statVpn) => statVpn.publicKey === cur.pub)
            if (vpn?.transferRx != undefined && vpn?.transferTx != undefined) {
                hash[cur.userId].push({
                    rx: vpn.transferRx,
                    tx: vpn.transferTx,
                })
            }

            return hash
        }, {})
    }

    private combineHashMapVpns(hashmap: IRawVPNHashMap) {
        return Object.keys(hashmap).reduce((outMap, key) => {
            outMap[key] = hashmap[key].reduce(
                (acc, vpn) => {
                    acc.tx += vpn.tx
                    acc.rx += vpn.rx
                    return acc
                },
                { rx: 0, tx: 0 },
            )

            return outMap
        }, {} as IVPNHashMap)
    }

    private registerRoutes() {
        this.app.get("/metrics", async (req, res, next) => {
            const rawHashMap = await this.getUserVpnHashMap()
            const combinedHashMap = this.combineHashMapVpns(rawHashMap)

            console.log(combinedHashMap)

            res.send("metrics works")
        })
    }

    start() {
        this.app.listen(8081)
    }
}
