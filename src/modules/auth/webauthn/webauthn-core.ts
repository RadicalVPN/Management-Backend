import { server } from "@passwordless-id/webauthn"
import { RegistrationParsed } from "@passwordless-id/webauthn/dist/esm/types"
import { db } from "../../../database"
import { User } from "../../user/user"
import { WebAuthnChallengeHelper } from "./webauth-challenge-helper"

export type TExpressSession = Express.Request["session"]

export class WebAuthn extends WebAuthnChallengeHelper {
    private origin: string
    private user: User

    constructor(user: User, session: TExpressSession) {
        super(session)

        this.origin = "https://radicalvpn.com"
        this.user = user
    }

    async verifyRegistration(registration: any) {
        try {
            const result = await server.verifyRegistration(registration, {
                challenge: await this.getLastChallenge(),
                origin: this.origin,
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
