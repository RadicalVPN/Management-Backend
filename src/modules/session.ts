import { Request } from "express"
import { Redis } from "./redis"

export class Session {
    regenerate(maxAge: number, req: Request): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) {
                    return reject(err)
                }

                req.session.cookie.maxAge = maxAge
                resolve()
            })
        })
    }

    async invalidateAllUserSessions(email: string) {
        const redis = await Redis.getInstance()
        const keys: string[] = []

        for await (const key of redis.scanIterator({
            MATCH: `radical_vpn:session:${email}:*`,
        })) {
            keys.push(key)
        }

        const cnt = await redis.del(keys)
        console.log(`invalidated ${cnt} sessions for user ${email}`)
    }
}
