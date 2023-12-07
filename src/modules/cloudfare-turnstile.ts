import axios from "axios"
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
        return challengeData.success === true
    }

    private async fetchChallengeData(): Promise<IChallengeData> {
        try {
            return (
                await axios.post(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    querystring.stringify({
                        secret: config.ClOUDFLARE.TURNSTILE.SECRET_KEY,
                        response: this.challengeId,
                    }),
                )
            ).data
        } catch (e) {
            console.error(e)
            return {
                success: false,
                "error-codes": ["internal-server-error-radical"],
            }
        }
    }
}
