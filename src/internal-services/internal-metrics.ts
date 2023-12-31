import express, { Express } from "express"
import morgan from "morgan"
import { Registry, collectDefaultMetrics } from "prom-client"
import { GenericInternalService } from "./generic-internal-service"

export class InternalMetrics extends GenericInternalService {
    registry: Registry
    app: Express

    constructor() {
        super()

        this.registry = new Registry()
        this.app = express()

        this.registerMiddlewares()
        this.colletDefaultMetrics()
    }

    start() {
        this.app.get("/cluster_metrics", async (req, res) => {
            res.set("Content-Type", this.registry.contentType)
            res.end(await this.registry.metrics())
        })
        this.app.listen(8082)
    }

    private registerMiddlewares() {
        this.app.use(morgan("dev", {}))
    }

    private colletDefaultMetrics() {
        console.log("collecting default metrics")
        collectDefaultMetrics()
    }
}
