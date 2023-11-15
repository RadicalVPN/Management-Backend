import cluster from "node:cluster"
import { config } from "./config"
import { DockerProcessInspector } from "./docker-process-inspector"
import { InternalMetrics } from "./internal-services/internal-metrics"
import { NodeAvailabilityChecker } from "./modules/nodes/node-availability-check"
import { VpnGarbageCollector } from "./modules/vpn-gc"
import * as util from "./util"

function createForks() {
    const workerCount = config.SERVER.WORKER
    for (let i = 0; i < workerCount; i++) {
        cluster.fork()
    }
}

function onClusterError() {
    cluster.on("exit", (worker, code, signal) => {
        const infos = { code, signal }

        console.log(
            `worker ${worker.process.pid} died ${JSON.stringify(
                infos,
            )}, respawning..`,
        )
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
        await NodeAvailabilityChecker.startCheckInterval()
        new VpnGarbageCollector()
    } else {
        console.log(
            `Starting Radical VPN Backend Server - Cluster Worker ${process.pid}`,
        )

        require("./server")
    }
})().catch((err) => {
    console.error("Failed to start RadicalVPN Cluster", err)
    process.exit(1)
})
