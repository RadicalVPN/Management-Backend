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
                hash[cur.userId] = {
                    rx: 0,
                    tx: 0,
                }
            }

            const vpn = stats.find((statVpn) => statVpn.publicKey === cur.pub)
            if (vpn?.transferRx != undefined && vpn?.transferTx != undefined) {
                hash[cur.userId].rx += vpn.transferRx
                hash[cur.userId].tx += vpn.transferTx
            }

            return hash
        }, {})
    }

    private registerRoutes() {
        this.app.get("/metrics", async (req, res, next) => {
            const hashmap = await this.getUserVpnHashMap()

            console.log(hashmap)

            res.send("metrics works")
        })
    }

    start() {
        this.app.listen(8081)
    }
}
