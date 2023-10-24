import express, { Express } from "express"
import { NodeFactory } from "../modules/nodes/node-factory"
import { GenericInternalService } from "./generic-internal-service"

export class PrometheusServiceDiscovery extends GenericInternalService {
    app: Express

    constructor() {
        super()

        this.app = express()
    }

    start() {
        this.app.get("/http_sd", async (req, res) => {
            res.send(await this.getAllServices())
        })
        this.app.listen(8083)
    }

    async getAllServices() {
        const nodes = await new NodeFactory().getAll()

        return nodes.map((node) => {
            const data = node.data

            return {
                targets: [`${data.internal_ip}:6969`],
                labels: {
                    __meta_dc: data.country,
                    __meta_city: data.city,
                    __meta_hostname: data.hostname,
                    __meta_externalIp: data.external_ip,
                    __meta_internalIp: data.internal_ip,
                },
            }
        })
    }
}
