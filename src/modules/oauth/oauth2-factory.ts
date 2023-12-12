import { db } from "../../database"
import { OAuth2Client } from "./oauth2"

export interface OAuth2Info {
    clientName: string
    clientId: string
    clientSecret: string
    redirectUrl: string
    grants: string
}

export class OAuth2ClientFactory {
    async getAll() {
        const data = await db.table("oauth_clients").select("*")

        return data.map((_data) => new OAuth2Client(_data))
    }

    async get(id: string): Promise<OAuth2Client | undefined> {
        const data = await db
            .table("oauth_clients")
            .select("*")
            .where("clientId", id)
            .first()

        return data ? new OAuth2Client(data) : undefined
    }
}
