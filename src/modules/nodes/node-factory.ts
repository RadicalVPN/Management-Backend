import { db } from "../../database"
import { Node } from "./node"

export interface VpnNode {
    id: string
    hostname: string
    city: string
    country_code: string
    country_name: string
    latitude: string
    longitude: string
    internal_ip: string
    external_ip: string
    public_key: string
    private_key: string
    node_location: string
}

export class NodeFactory {
    async getAll(): Promise<Node[]> {
        const data = await db
            .table("nodes")
            .join("node_locations", "node_locations.id", "nodes.node_location")
            .select(
                "*",
                "nodes.id as id",
                "node_locations.id as node_location_id",
            )

        return data.map((_data) => new Node(_data))
    }

    async get(id: string): Promise<Node | undefined> {
        const data = (
            await db
                .table("nodes")
                .join(
                    "node_locations",
                    "node_locations.id",
                    "nodes.node_location",
                )
                .select(
                    "*",
                    "nodes.id as id",
                    "node_locations.id as node_location_id",
                )
                .where("nodes.id", id)
        )?.[0]

        return data ? new Node(data) : undefined
    }
}
