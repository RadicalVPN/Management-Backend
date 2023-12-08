import crypto, { randomUUID } from "crypto"
import { db } from "../../database"
import { Base32 } from "../base32"
import { EmailQueueManager } from "../common/email/email-queue-manager"
import { UserError } from "../common/user-error"

export interface UserData {
    id: number
    username: string
    email: string
    passwordHash: string
    passwordSalt: string
    active: number
    createdAt: string
    updatedAt: string
    emailVerified: boolean
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

    async disableTotp() {
        await db.table("users_totp").delete().where("userId", this.userData.id)
    }

    async updateUsername(username: string) {
        const alreadyExists = await db
            .table("users")
            .where("username", username)
            .first()

        if (alreadyExists !== undefined) {
            throw new UserError("username already in use")
        }

        await db
            .table("users")
            .update({
                username,
            })
            .where("id", this.userData.id)
    }

    async generateVerificationCode() {
        const verifyToken = randomUUID()

        //remove old tokens, so when a user resends the email, the old token gets invalidated
        await db
            .table("users_verify")
            .delete()
            .where("userId", this.userData.id)

        await db.table("users_verify").insert({
            userId: this.userData.id,
            verifyToken: verifyToken,
        })

        //send our invite email
        await new EmailQueueManager().addJob({
            to: this.userData.email,
            subject: "RadicalVPN - Verify your email",
            templateName: "email-confirmation",
            templateData: {
                username: this.userData.username,
                verificationUrl: `https://radicalvpn.com/api/1.0/auth/verify/${verifyToken}`,
            },
        })

        return verifyToken
    }

    async confirmEmail() {
        //update the user
        await db
            .table("users")
            .update({
                emailVerified: true,
            })
            .where("id", this.userData.id)

        //remove the token
        await db
            .table("users_verify")
            .delete()
            .where("userId", this.userData.id)
    }
}
