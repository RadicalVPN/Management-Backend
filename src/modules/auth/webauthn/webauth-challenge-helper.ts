import { randomUUID } from "crypto"
import { Redis } from "../../redis"
import { User } from "../../user/user"

export class WebAuthnChallengeHelper {
    user: User

    constructor(user: User) {
        this.user = user
    }

    async generateChallenge(): Promise<string> {
        const redis = await Redis.getInstance()

        //make sure to use a cryptographically uuid to prevent replay attacks
        const challengeId = randomUUID()

        await redis.set(this.getCacheKey(), challengeId, {
            EX: 60 * 2, // 2 minutes
        })

        return challengeId
    }

    async getLastChallenge(): Promise<string> {
        const redis = await Redis.getInstance()

        //consume the challenge once used
        const challenge = await redis.getDel(this.getCacheKey())

        return challenge ?? "dummy"
    }

    private getCacheKey() {
        return `webauthn:${this.user.userData.id}`
    }
}
