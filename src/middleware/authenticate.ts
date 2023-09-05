import { NextFunction, Request, Response } from "express"

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    //authenticiation middleware, next routers need all a signed in user!
    if (!req.session.authed) {
        return res.status(401).send("not authenticated")
    }

    if (!req.session.userInfo?.active) {
        return res.status(401).send("user locked")
    }

    next()
}
