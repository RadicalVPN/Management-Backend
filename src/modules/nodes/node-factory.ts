import { db } from "../../database"

interface Node {
    hostname: string
    country: string
    city: string
    internal_ip: string
    external_ip: string
}

export class NodeFactory {
    async getAll(): Promise<Node[]> {
        return await db.table("nodes").select("*")
    }

    async get(id: number): Promise<Node> {
        return (await db.table("nodes").select("*").where("id", id))?.[0]
    }
}
