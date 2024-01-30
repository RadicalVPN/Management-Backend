import { Queue } from "bullmq"
import { Node } from "../nodes/node"
import { Redis } from "../redis"

export class VpnPublishQueue {
    private static queues = new Map<string, Queue>()
    private readonly node: Node

    constructor(node: Node) {
        this.node = node
    }

    private getNodeHostName() {
        return this.node.data.hostname
    }

    async publish(config: string) {
        await (
            await Redis.getInstance()
        ).rPush(
            `vpn_manager:publish_queue:${this.getNodeHostName()}`,
            JSON.stringify({
                config,
            }),
        )
    }
}
