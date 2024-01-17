import { server } from "@passwordless-id/webauthn"
import { RegistrationParsed } from "@passwordless-id/webauthn/dist/esm/types"
import { db } from "../../../database"
import { User } from "../../user/user"
import { WebAuthnChallengeHelper } from "./webauth-challenge-helper"

export type TExpressSession = Express.Request["session"]

export class WebAuthn extends WebAuthnChallengeHelper {
    private origin: string
    private user?: User

    constructor(session: TExpressSession, user?: User) {
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
                user: this.user!.userData.id,
            })

            return this.handleException(e)
        }
    }

    async verifyAuthentification(authentification: any) {
        try {
            const challenge = await this.getLastChallenge()
            const credentialKey = await db
                .table("users_webauth_credentials")
                .select(
                    "credentialId AS id",
                    "credentialPublicKey AS publicKey",
                    "credentialAlgorithm AS algorithm",
                )
                .first()

            if (!credentialKey) {
                return {
                    success: false,
                    message: "No credential found",
                }
            }

            await server.verifyAuthentication(authentification, credentialKey, {
                challenge: challenge,
                origin: this.origin,
                userVerified: true,
            })

            return {
                success: true,
            }
        } catch (e) {
            console.error("webauthn authentification failed", {
                error: e,
                session: this.session.id,
            })

            return this.handleException(e)
        }
    }

    private handleException(e: any) {
        return {
            success: false,
            message:
                e instanceof TypeError ? "Unknown internal error" : e.message,
        }
    }

    private async storeCredential(
        registration: RegistrationParsed,
    ): Promise<void> {
        await db.table("users_webauth_credentials").insert({
            userId: this.user!.userData.id,
            authenticatorName:
                registration.authenticator.name ?? "Unknown Name",
            credentialId: registration.credential.id,
            credentialPublicKey: registration.credential.publicKey,
            credentialAlgorithm: registration.credential.algorithm,
            lastUsage: new Date(null as any), //1970
        })
    }
}
