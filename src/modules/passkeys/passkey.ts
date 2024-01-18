import { db } from "../../database"

export interface PasskeyData {
    id: string
    userId: string
    authenticatorName: string
    credentialId: string
    credentialPublicKey: string
    credentialAlgorithm: string
    lastUsage: string
    createdAt: string
    updatedAt: string
}

export class Passkey {
    constructor(readonly data: PasskeyData) {}

    getInfo() {
        return {
            id: this.data.id,
            authenticatorName: this.data.authenticatorName,
            algorithm: this.data.credentialAlgorithm,
            lastUsage: this.data.lastUsage,
        }
    }

    async updateLastUsage() {
        await db
            .table("users_webauth_credentials")
            .update("lastUsage", new Date())
            .where("id", this.data.id)
    }
}
