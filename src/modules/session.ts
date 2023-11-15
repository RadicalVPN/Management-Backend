import { Request } from "express"

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
}
