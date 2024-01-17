import { Request } from "express"
import { Redis } from "./redis"
import { User } from "./user/user"

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

    prepareUserSession(req: Request, user: User) {
        req.session.authed = true
        req.session.userInfo = {
            active: user.userData.active == 1,
            email: user.userData.email,
            username: user.userData.username,
            id: user.userData.id,
            scopes: user.userData.scopes,
        }
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
