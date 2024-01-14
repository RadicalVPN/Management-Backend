import { server } from "@passwordless-id/webauthn"
import { RegistrationParsed } from "@passwordless-id/webauthn/dist/esm/types"
import { db } from "../../../database"
import { User } from "../../user/user"
import { WebAuthnChallengeHelper } from "./webauth-challenge-helper"

export class WebAuthn extends WebAuthnChallengeHelper {
    constructor(user: User) {
        super(user)
    }

    async verifyChallenge(registration: any) {
        const origin = "https://radicalvpn.com"

        try {
            const result = await server.verifyRegistration(registration, {
                challenge: await this.getLastChallenge(),
                origin,
            })

            await this.storeCredential(result)

            return {
                success: true,
            }
        } catch (e: any) {
            console.error("webauthn setup failed", {
                error: e,
                user: this.user.userData.id,
            })

            return {
                success: false,
                message:
                    e instanceof TypeError
                        ? "Unknown internal error"
                        : e.message,
            }
        }
    }

    private async storeCredential(
        registration: RegistrationParsed,
    ): Promise<void> {
        await db.table("users_webauth_credentials").insert({
            userId: this.user.userData.id,
            authenticatorName:
                registration.authenticator.name ?? "Unknown Name",
            credentialId: registration.credential.id,
            credentialPublicKey: registration.credential.publicKey,
            credentialAlgorithm: registration.credential.algorithm,
            lastUsage: new Date(null as any), //1970
        })
    }
}
