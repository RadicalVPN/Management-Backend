import * as crypto from "crypto"
import { db } from "../../database"
import { User, UserData } from "./user"

export class UserCreationError extends Error {}
export class UserFactory {
    static pbkdf2Config = {
        iterations: 600_123,
        keyLen: 64,
        digest: "sha512",
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
            Buffer.from(user.userData.passwordSalt, "hex"),
        )

        return hash.toString("hex") === user.userData.passwordHash
    }

    async findUserByEmail(email: string): Promise<User | undefined> {
        const userData: UserData | undefined = (
            await db.table("users").select("*").where("email", email)
        )?.[0]

        if (!userData) return

        return new User(userData)
    }

    async findUserByName(username: string): Promise<User | undefined> {
        const userData: UserData | undefined = (
            await db.table("users").select("*").where("username", username)
        )?.[0]

        if (!userData) return

        return new User(userData)
    }

    private generatePbkfs2Hash(password: Buffer, salt: Buffer) {
        return crypto.pbkdf2Sync(
            password,
            salt,
            UserFactory.pbkdf2Config.iterations,
            UserFactory.pbkdf2Config.keyLen,
            UserFactory.pbkdf2Config.digest,
        )
    }

    static computeTotpUri(secret: string, email: string, username: string) {
        return `otpauth://totp/${username}:${email}@test.test?secret=${secret}&issuer=RadicalVPN`
    }
}
