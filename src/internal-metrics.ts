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
        this.app.get("/metrics", (req, res) => {
            res.set("Content-Type", this.registry.contentType)
            res.end(this.registry.metrics())
        })
        this.app.listen(8082)
    }
}
