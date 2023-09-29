import express, { Express } from "express"
import { Registry, collectDefaultMetrics } from "prom-client"

export class InternalMetrics {
    registry: Registry
    app: Express

    constructor() {
        this.registry = new Registry()
        this.app = express()

        collectDefaultMetrics({ register: this.registry })
    }

    start() {
        this.app.get("/metrics", async (req, res) => {
            res.set("Content-Type", this.registry.contentType)
            res.end(await this.registry.metrics())
        })
        this.app.listen(8082)
    }
}
