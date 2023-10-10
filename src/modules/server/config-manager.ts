import { config } from "../../config"
import { Redis } from "../Redis"
import { Node } from "../nodes/node"
import { NodeFactory } from "../nodes/node-factory"
import { VPNFactory } from "../vpn/vpn-factory"

export class ConfigManager {
    static async publishServerConfig(node: "global" | string) {
        const redis = await Redis.getInstance()

        if (node === "all") {
            const nodes = await new NodeFactory().getAll()
            await Promise.all(
                nodes.map(async (_node) => {
                    const clientsRecieved = await redis.publish(
                        `publish_config:${_node.data.hostname}`,
                        await this.computeServerConfig(
                            await this.computeClients(_node),
                            _node,
                        ),
                    )
                    if (clientsRecieved === 0) {
                        console.log(
                            `vpn node ${_node.data.hostname} is offline.`,
                        )
                    }
                }),
            )
        } else {
            const vpnNode = await new NodeFactory().get(node)
            if (vpnNode) {
                const clientsRecieved = await redis.publish(
                    `publish_config:${vpnNode.data.hostname}`,
                    await this.computeServerConfig(
                        await this.computeClients(vpnNode),
                        vpnNode,
                    ),
                )
                if (clientsRecieved === 0) {
                    console.log(`vpn node ${vpnNode.data.hostname} is offline.`)
                }
            }
        }
    }

    private static async computeClients(node: Node) {
        const clients = await VPNFactory.getForNode(node.data.id)
        return clients.reduce(
            (arr, client) => {
                arr.push(
                    [
                        `# Client: ${client.alias} (${client.id}) - ${node.data.hostname}`,
                        "[Peer]",
                        `PublicKey = ${client.pub}`,
                        `PresharedKey = ${client.psk}`,
                        `AllowedIPs = ${client.ipv4}/32, ${client.ipv6}/128`,
                        "",
                    ].join("\n"),
                )

                return arr
            },
            [""],
        )
    }

    private static computeServerConfig(clients: any, node: Node) {
        return [
            "# Note: Do not edit this file directly. It is generated by the RadicalVPN server.",
            "# Your changes will be overwritten!",
            `# Generated for Radical VPN Node: ${node.data.hostname}`,
            "",
            "# Server",
            "[Interface]",
            `Address = ${config.VPN.VPN_INTERFACE_IPS.V4}, ${config.VPN.VPN_INTERFACE_IPS.V6}`,
            `PrivateKey = ${node.data.private_key}`,
            "ListenPort = 51820",
            ...clients,
        ].join("\n")
    }
}
