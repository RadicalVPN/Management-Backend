import { RegistrationParsed } from "@passwordless-id/webauthn/dist/esm/types"
import { db } from "../../database"
import { User, UserData } from "../user/user"
import { Passkey } from "./passkey"

export class PasskeyFactory extends User {
    private user: UserData

    constructor(user: UserData) {
        super(user)

        this.user = user
    }

    async getAll() {
        const data = (await db
            .table("users_webauth_credentials")
            .select("*")
            .where("userId", this.userData.id)) as any[]

        return data.map((_data) => new Passkey(_data))
    }

    async get(id: string) {
        const data = await db
            .table("users_webauth_credentials")
            .select("*")
            .where("id", id)
            .where("userId", this.userData.id)
            .first()

        return data ? new Passkey(data) : null
    }

    static async getByCredentialId(credentialId: string) {
        const data = await db
            .table("users_webauth_credentials")
            .select("*")
            .where("credentialId", credentialId)
            .first()

        return data ? new Passkey(data) : null
    }

    async add(registration: RegistrationParsed) {
        await db.table("users_webauth_credentials").insert({
            userId: this.user.id,
            authenticatorName:
                registration.authenticator.name ?? "Unknown Name",
            credentialId: registration.credential.id,
            credentialPublicKey: registration.credential.publicKey,
            credentialAlgorithm: registration.credential.algorithm,
            lastUsage: new Date(null as any), //1970
        })
    }
}
