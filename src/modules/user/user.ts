import crypto from "crypto"
import { db } from "../../database"
import { Base32 } from "../base32"

export interface UserData {
    id: number
    username: string
    email: string
    passwordHash: string
    passwordSalt: string
    active: number
    createdAt: string
    updatedAt: string
}

export class User {
    userData: UserData

    constructor(data: UserData) {
        this.userData = data
    }

    async confirmTotp() {
        await db
            .table("users_totp")
            .update({
                confirmed: true,
            })
            .where("userId", this.userData.id)
    }

    async generateTotpSecret() {
        const currentSecret = await this.getTotpSecret()

        if (currentSecret) {
            return currentSecret
        }

        const newSecret = Base32.encode(crypto.randomBytes(20)).toString()
        await db.table("users_totp").insert({
            privateKey: newSecret,
            confirmed: false,
            userId: this.userData.id,
        })

        return newSecret
    }

    async getTotpSecret(): Promise<string | undefined> {
        return (
            await db
                .table("users_totp")
                .select("privateKey")
                .where("userId", this.userData.id)
        )?.[0]?.privateKey
    }

    async isTotpEnabled() {
        return (
            (
                await db
                    .table("users_totp")
                    .select("confirmed")
                    .where("userId", this.userData.id)
            )?.[0]?.confirmed == 1 || false
        )
    }
}
