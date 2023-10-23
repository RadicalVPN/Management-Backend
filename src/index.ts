import cluster from "node:cluster"
import { cpus } from "node:os"
import { DockerProcessInspector } from "./docker-process-inspector"
import { InternalMetrics } from "./internal-metrics"
import { NodeAvailabilityChecker } from "./modules/nodes/node-availability-check"
import * as util from "./util"

function createForks() {
    const cpuCnt = cpus().length
    for (let i = 0; i < cpuCnt; i++) {
        cluster.fork()
    }
}

function onClusterError() {
    cluster.on("exit", (worker, code, signal) => {
        const infos = { code, signal }

        console.log(`worker ${worker.process.pid} died ${infos}, respawning..`)
        cluster.fork()
    })
}

const internalMetrics = new InternalMetrics()

;(async () => {
    if (cluster.isPrimary) {
        console.log("Starting Radical VPN Backend Server - Cluster Primary")

        if (DockerProcessInspector.isDocker()) {
            console.log("Starting database migration")

            console.log(
                await util.exec("npx knex migrate:latest --env production"),
            )
        }

        createForks()
        internalMetrics.start()
        onClusterError()
        NodeAvailabilityChecker.startCheckInterval()
    } else {
        console.log(
            `Starting Radical VPN Backend Server - Cluster Worker ${process.pid}`,
        )

        require("./server")
    }
})()
