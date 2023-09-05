import { NextFunction, Request, Response } from "express"
import { User } from "../modules/user/user"
import { UserFactory } from "../modules/user/user-factory"

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

    // @ts-ignore
    req.locals = {}

    req.locals.user = (await new UserFactory().findUserByName(
        req.session.userInfo.username,
    )) as User

    next()
}
