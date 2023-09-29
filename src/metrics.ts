import axios from "axios"
import express, { Express } from "express"
import morgan from "morgan"
import { WireguardParser } from "./WireguardParser"
import { config } from "./config"
import { VPNFactory } from "./modules/vpn/vpn-factory"

interface IVPNStat {
    rx: number
    tx: number
}

interface IRawVPNHashMap {
    [userId: string]: IVPNStat
}

export class Metrics {
    private app: Express

    constructor() {
        this.app = express()
        this.registerMiddlewares()
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

    private async getPrometheusMetrics() {
        const hashmap = await this.getUserVpnHashMap()

        return Object.keys(hashmap).reduce((acc, cur) => {
            acc += `wireguard_rx{userId="${cur}"} ${hashmap[cur].rx}\n`
            acc += `wireguard_tx{userId="${cur}"} ${hashmap[cur].tx}\n`

            return acc
        }, "")
    }

    private registerMiddlewares() {
        this.app.use(morgan("dev"))
    }

    private registerRoutes() {
        this.app.get("/metrics", async (req, res, next) => {
            res.send(await this.getPrometheusMetrics())
        })
    }

    start() {
        this.app.listen(8081)
    }

    static async getMetricsFromPrometheus(
        query: string,
        start: number,
        end: number,
    ) {
        const data = (
            await axios.get(
                `http://${config.PROMETHEUS.HOST}/api/v1/query_range`,
                {
                    params: {
                        query,
                        start,
                        end,
                        step: 10,
                    },
                },
            )
        ).data

        if (data.data.result.length === 0) {
            return []
        }

        return data.data.result[0].values.map((point: any) => {
            return {
                label: new Date(point[0] * 1000),
                value: Number(point[1]),
            }
        })
    }
}
