import { Request } from "express"
import { Redis } from "./redis"

export class Session {
    regenerate(req: Request, maxAge?: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) {
                    return reject(err)
                }

                if (maxAge) {
                    req.session.cookie.maxAge = maxAge
                }

                resolve()
            })
        })
    }

    async invalidateAllUserSessions(
        email: string,
        ignoredSessions: string[] = [],
    ) {
        const redis = await Redis.getInstance()
        let keys: string[] = []

        for await (const key of redis.scanIterator({
            MATCH: `radical_vpn:session:${email}:*`,
        })) {
            keys.push(key)
        }

        keys = keys.filter((key) => !ignoredSessions.includes(key))

        if (keys.length > 0) {
            const cnt = await redis.del(keys)

            console.log(`invalidated ${cnt} sessions for user ${email}`)
        }
    }
}
