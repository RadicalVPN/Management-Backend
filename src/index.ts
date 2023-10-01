import cluster from "node:cluster"
import { cpus } from "node:os"
import { InternalMetrics } from "./internal-metrics"
import * as util from "./util"

function createForks() {
    const cpuCnt = cpus().length
    for (let i = 0; i < cpuCnt; i++) {
        cluster.fork()
    }
}

function startInternalMetrics() {
    console.log("Starting Internal Metrics server")
    const internalMetrics = new InternalMetrics()
    internalMetrics.start()
}

;(async () => {
    if (cluster.isPrimary) {
        console.log("Starting Radical VPN Backend Server - Cluster Primary")

        console.log("Starting database migration")
        console.log(await util.exec("npx knex migrate:latest --env production"))

        startInternalMetrics()
        createForks()

        cluster.on("exit", (worker, code, signal) => {
            const infos = { code, signal }

            console.log(
                `worker ${worker.process.pid} died ${infos}, respawning..`,
            )
            cluster.fork()
        })
    } else {
        console.log(
            `Starting Radical VPN Backend Server - Cluster Worker ${process.pid}`,
        )
        require("./server")
    }
})()
