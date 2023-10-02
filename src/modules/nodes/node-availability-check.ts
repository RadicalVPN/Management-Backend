import { config } from "../../config"
import { Redis } from "../Redis"
import { Node } from "./node"
import { NodeFactory } from "./node-factory"

export class NodeAvailabilityChecker {
    static startCheckInterval() {
        this.startPongListener()

        setInterval(async () => {
            const nodes = await new NodeFactory().getAll()

            for (const node of nodes) {
                await this.sendPingEvent(node)
            }
        }, 1000 * config.VPN.NODE_AVAILABILITY_CHECK_INTERVAL_SEC)
    }

    private static async startPongListener() {
        const redis = await Redis.getInstance()
        const nodes = await new NodeFactory().getAll()
        const subscribeChannels = nodes.map(
            (node) => `pong:${node.data.hostname}`,
        )

        await redis.executeIsolated(async (client) => {
            await client.subscribe(
                subscribeChannels,
                async (message, channel) => {
                    const nodeId = channel.split(":")[1]
                    console.log(`got pong message from node ${nodeId}`)

                    //set node as active in redis cache
                    await redis.set(`node:${nodeId}:active`, "1", {
                        EX: 30, //the node will be marked as inactive if it doesn't send a pong message within 30 seconds
                    })
                },
            )
        })
    }

    private static async sendPingEvent(node: Node) {
        const redis = await Redis.getInstance()

        console.log(`sending ping to node ${node.data.hostname}`)

        await redis.publish(`ping:${node.data.hostname}`, "")
    }

    static async isNodeActive(node: Node) {
        const redis = await Redis.getInstance()

        return (await redis.get(`node:${node.data.hostname}:active`)) === "1"
    }
}
