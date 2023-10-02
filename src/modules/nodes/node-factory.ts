import { db } from "../../database"
import { Node } from "./node"

export interface VpnNode {
    id: string
    hostname: string
    country: string
    city: string
    internal_ip: string
    external_ip: string
    public_key: string
    private_key: string
}

export class NodeFactory {
    async getAll(): Promise<Node[]> {
        const data = await db.table("nodes").select("*")

        return data.map((_data) => new Node(_data))
    }

    async get(id: string): Promise<Node | undefined> {
        const data = (await db.table("nodes").select("*").where("id", id))?.[0]

        return data ? new Node(data) : undefined
    }
}
