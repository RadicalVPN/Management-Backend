import { db } from "../../database"

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
    async getAll(): Promise<VpnNode[]> {
        return await db.table("nodes").select("*")
    }

    async get(id: string): Promise<VpnNode> {
        return (await db.table("nodes").select("*").where("id", id))?.[0]
    }
}
