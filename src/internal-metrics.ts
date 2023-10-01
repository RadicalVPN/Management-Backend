import express, { Express } from "express"
import morgan from "morgan"
import { AggregatorRegistry, collectDefaultMetrics } from "prom-client"

export class InternalMetrics {
    registry: AggregatorRegistry
    app: Express

    constructor() {
        this.registry = new AggregatorRegistry()
        this.app = express()
        this.registerMiddlewares()
    }

    start() {
        this.app.get("/cluster_metrics", async (req, res) => {
            res.set("Content-Type", this.registry.contentType)
            res.end(await this.registry.clusterMetrics())
        })
        this.app.listen(8082)
    }

    private registerMiddlewares() {
        this.app.use(morgan("dev", {}))
    }

    static collectDefaultMetrics() {
        collectDefaultMetrics()
    }
}
