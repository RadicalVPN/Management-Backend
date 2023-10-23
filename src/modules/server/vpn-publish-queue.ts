import { Queue } from "bullmq"
import { config } from "../../config"
import { Node } from "../nodes/node"

export class VpnPublishQueue {
    private static queues = new Map<string, Queue>()
    private readonly node: Node

    constructor(node: Node) {
        this.node = node
    }

    private getNewQueue() {
        const url = new URL(config.REDIS.URI)

        return new Queue(this.node.data.hostname, {
            connection: {
                host: url.hostname,
                port: parseInt(url.port || "6379"),
            },
            prefix: "vpn:publish",
        })
    }

    async publish(config: string) {
        const queue =
            VpnPublishQueue.queues.get(this.node.data.hostname) ??
            this.getNewQueue()

        if (queue) {
            await queue.add("publish", {
                config: config,
            })
        }
    }
}
