import { db } from "../database"
import * as crypto from "crypto"

export class UserCreationError extends Error {}

export class User {
    static pbkdf2Config = {
        iterations: 600_123,
        keyLen: 64,
        digest: "sha512",
    }

    async add(username: string, email: string, password: string) {
        if (await this.findUserByEmail(email)) {
            throw new UserCreationError(`User ${username} already exists`)
        }

        const salt = crypto.randomBytes(64)
        const hash = this.generatePbkfs2Hash(Buffer.from(password), salt)

        await db.table("users").insert({
            username,
            email,
            passwordHash: hash.toString("hex"),
            passwordSalt: salt.toString("hex"),
            active: true,
        })
    }

    async authenticate(email: string, password: string): Promise<boolean> {
        const user = await this.findUserByEmail(email)
        if (!user) return false

        const hash = this.generatePbkfs2Hash(
            Buffer.from(password),
            Buffer.from(user.passwordSalt, "hex"),
        )

        return hash.toString("hex") === user.passwordHash
    }

    private async findUserByEmail(email: string) {
        return (await db.table("users").select("*").where("email", email))?.[0]
    }

    private generatePbkfs2Hash(password: Buffer, salt: Buffer) {
        return crypto.pbkdf2Sync(
            password,
            salt,
            User.pbkdf2Config.iterations,
            User.pbkdf2Config.keyLen,
            User.pbkdf2Config.digest,
        )
    }
}
