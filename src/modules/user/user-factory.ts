import { db } from "../../database"
import { Scopes } from "./scopes"
import { User } from "./user"

export class UserCreationError extends Error {}
export class UserFactory {
    async getAll() {
        const data = await db
            .table("users")
            .leftJoin("users_scopes", "users_scopes.userId", "users.id")
            .leftJoin("scopes", "scopes.id", "users_scopes.scopeId")
            .select(
                "users.*",
                db.raw("string_agg(scopes.\"name\", ',') as aggregatedscopes"),
            )
            .groupBy("users.id")

        return data.map((_data) => new User(_data))
    }

    async findUserById(userId: string): Promise<User | undefined> {
        const data = await db
            .table("users")
            .leftJoin("users_scopes", "users_scopes.userId", "users.id")
            .leftJoin("scopes", "scopes.id", "users_scopes.scopeId")
            .select(
                "users.*",
                db.raw("string_agg(scopes.\"name\", ',') as aggregatedscopes"),
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

        await db.table("users").insert({
            username,
            email,
            passwordHash: await Bun.password.hash(password),
            active: true,
        })

        //add initial scopes
        const user = await this.findUserByEmail(email)

        if (user) {
            const userId = user.userData.id

            const scopes = [
                await Scopes.getScopeIdByName("user"),
                await Scopes.getScopeIdByName("vpn:create"),
            ]

            await db.table("users_scopes").insert(
                scopes.map((scopeId) => ({
                    scopeId,
                    userId,
                })),
            )

            await user.generateVerificationCode()
        }
    }

    async authenticate(email: string, password: string): Promise<boolean> {
        const user = await this.findUserByEmail(email)
        if (!user) {
            return false
        }

        return await Bun.password.verify(password, user.userData.passwordHash)
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const userId: string | undefined = (
            await db.table("users").select("id").where("email", email).first()
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
        const { userId } = await db
            .table("users_verify")
            .select("userId")
            .where("verifyToken", verifyToken)
            .where("createdAt", ">", db.raw("NOW() - INTERVAL '1 hour'"))
            .first()

        if (!userId) {
            return
        }

        return await this.findUserById(userId)
    }

    static computeTotpUri(secret: string, email: string, username: string) {
        return `otpauth://totp/${username}:${email}@test.test?secret=${secret}&issuer=RadicalVPN`
    }
}
