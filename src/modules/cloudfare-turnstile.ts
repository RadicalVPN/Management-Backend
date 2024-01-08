import querystring from "querystring"
import { config } from "../config"

interface IChallengeData {
    success: boolean
    "error-codes": string[]
    challenge_ts?: string
    hostname?: string
    action?: string
    cdata?: string
    metadata?: {
        interactive?: boolean
    }
}

export class CloudflareTurnstile {
    constructor(readonly challengeId: string) {}

    async verify(): Promise<boolean> {
        const challengeData = await this.fetchChallengeData()

        console.log(
            "cloudflare turnstile challenge status",
            challengeData.success ? "SUCCESS" : "FAILED",
        )

        return challengeData.success === true
    }

    private async fetchChallengeData(): Promise<IChallengeData> {
        try {
            const url = new URL(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            )

            const res = await fetch(url, {
                method: "POST",
                body: querystring.stringify({
                    secret: config.ClOUDFLARE.TURNSTILE.SECRET_KEY,
                    response: this.challengeId,
                }),
            })

            return await res.json()
        } catch (e) {
            console.error(e)
            return {
                success: false,
                "error-codes": ["internal-server-error-radical"],
            }
        }
    }
}
