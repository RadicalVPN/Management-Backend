import { server } from "@passwordless-id/webauthn"
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

            console.log(result)

            //TODO: store credential into db

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
}
