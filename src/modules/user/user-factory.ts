import { db } from "../../database"
import { CommonHashing } from "../common/hashing"
import { User } from "./user"

export class UserCreationError extends Error {}
export class UserFactory {
    async getAll() {
        const data = await db
            .table("users")
            .join("users_scopes", "users_scopes.userId", "users.id")
            .select(
                "users.*",
                db.raw(
                    "string_agg(users_scopes.\"scopeName\", ',') as aggregatedscopes",
                ),
            )
            .groupBy("users.id")

        return data.map((_data) => new User(_data))
    }

    async findUserById(userId: string): Promise<User | undefined> {
        const data = await db
            .table("users")
            .join("users_scopes", "users_scopes.userId", "users.id")
            .select(
                "users.*",
                db.raw(
                    "string_agg(users_scopes.\"scopeName\", ',') as aggregatedscopes",
                ),
            )
            .where("users.id", userId)
            .groupBy("users.id")
            .first()

        if (!data) {
            return
        }

        return new User(data)
    }

    async add(username: string, email: string, password: string) {
        if (
            (await this.findUserByEmail(email)) ||
            (await this.findUserByName(username))
        ) {
            throw new UserCreationError(
                `Either the email or the username is already in use`,
            )
        }

        const hashData = await CommonHashing.hashString(password)

        await db.table("users").insert({
            username,
            email,
            passwordHash: hashData.hash,
            passwordSalt: hashData.salt,
            active: true,
        })
    }

    async authenticate(email: string, password: string): Promise<boolean> {
        const user = await this.findUserByEmail(email)
        if (!user) {
            return false
        }

        const hash = await CommonHashing.generatePbkfs2Hash(
            Buffer.from(password),
            Buffer.from(user.userData.passwordSalt, "hex"),
        )

        return hash.toString("hex") === user.userData.passwordHash
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const userId: string | undefined = (
            await db.table("userId").select("id").where("email", email).first()
        )?.id

        if (!userId) {
            return
        }

        return await this.findUserById(userId)
    }

    async findUserByName(username: string): Promise<User | undefined> {
        const userId: string | undefined = (
            await db
                .table("users")
                .select("id")
                .where("username", username)
                .first()
        )?.id

        if (!userId) {
            return
        }

        return await this.findUserById(userId)
    }

    async findUserByVerifyToken(
        verifyToken: string,
    ): Promise<User | undefined> {
        const userId = (
            await db
                .table("users_verify")
                .select("id")
                .where("verifyToken", verifyToken)
                .where("createdAt", ">", db.raw("NOW() - INTERVAL '1 hour'"))
                .first()
        )?.id

        if (!userId) {
            return
        }

        return await this.findUserById(userId)
    }

    static computeTotpUri(secret: string, email: string, username: string) {
        return `otpauth://totp/${username}:${email}@test.test?secret=${secret}&issuer=RadicalVPN`
    }
}
