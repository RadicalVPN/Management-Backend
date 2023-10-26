import { Queue } from "bullmq"
import { config } from "../../config"
import { Node } from "../nodes/node"

export class VpnPublishQueue {
    private static queues = new Map<string, Queue>()
    private readonly node: Node

    constructor(node: Node) {
        this.node = node
    }

    private getNodeHostName() {
        return this.node.data.hostname
    }

    private getNewQueue() {
        const url = new URL(config.REDIS.URI)

        const queue = new Queue(this.getNodeHostName(), {
            connection: {
                host: url.hostname,
                port: parseInt(url.port || "6379"),
            },
            prefix: "vpn:publish",
        })

        VpnPublishQueue.queues.set(this.getNodeHostName(), queue)

        return queue
    }

    async publish(config: string) {
        const queue =
            VpnPublishQueue.queues.get(this.getNodeHostName()) ||
            this.getNewQueue()

        await queue.add("publish", {
            config: config,
            removeOnComplete: 1000,
        })
    }
}
