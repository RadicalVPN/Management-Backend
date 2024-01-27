import { db } from "../../database"

export class Scopes {
    static async getScopeIdByName(
        scopeName: string,
    ): Promise<number | undefined> {
        const scopeId = (
            await db
                .table("scopes")
                .select("id")
                .where("name", scopeName)
                .first()
        )?.id

        return scopeId
    }
}
