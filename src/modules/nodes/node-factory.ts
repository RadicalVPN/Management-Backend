import { db } from "../../database"

export class NodeFactory {
    async getAll() {
        return await db.table("nodes").select("*")
    }

    async get(id: number) {
        return (await db.table("nodes").select("*").where("id", id))?.[0]
    }
}
