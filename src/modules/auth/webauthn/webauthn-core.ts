import { server } from "@passwordless-id/webauthn"
import { PasskeyFactory } from "../../passkeys/passkey-factory"
import { User } from "../../user/user"
import { WebAuthnChallengeHelper } from "./webauth-challenge-helper"

export type TExpressSession = Express.Request["session"]
interface IAuthenticationResponse {
    success: boolean
    message?: string
    userId?: string
}

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

            await new PasskeyFactory(this.user!.userData).add(result)

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

    async verifyAuthentification(
        authentification: any,
    ): Promise<IAuthenticationResponse> {
        try {
            const challenge = await this.getLastChallenge()

            const passkey = await PasskeyFactory.getByCredentialId(
                authentification.credentialId,
            )

            if (!passkey) {
                return {
                    success: false,
                    message: "No credential found",
                }
            }

            await server.verifyAuthentication(
                authentification,
                {
                    id: passkey.data.credentialId,
                    publicKey: passkey.data.credentialPublicKey,
                    algorithm: passkey.data.credentialAlgorithm,
                },
                {
                    challenge: challenge,
                    origin: this.origin,
                    userVerified: true,
                },
            )

            await passkey.updateLastUsage()

            return {
                success: true,
                userId: passkey.data.userId,
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
}
