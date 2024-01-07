import { NextFunction, Request, Response } from "express"
import { User } from "../user/user"
import { UserFactory } from "../user/user-factory"
import { PermissionsEvaluator } from "./permissions-evaluator"

export class Bootstrap {
    static async middleware(req: Request, res: Response, next: NextFunction) {
        const permissionsEvaluator = await PermissionsEvaluator.create()
        const { path: obj, method: act } = req

        // if authed, check permissions based on scopes
        if (Bootstrap.isAuthenticatedUser(req)) {
            const scopes = req.session.userInfo?.scopes
            if (!scopes) {
                console.warn("user has no scopes in userInfo", req.session)
                return res.status(401).send()
            }

            //user locked / disabled?
            if (!req.session.userInfo?.active) {
                return res.status(403).send("user locked")
            }

            if (!(await permissionsEvaluator.evaluate(scopes, obj, act))) {
                return res.status(401).send()
            }
        } else {
            if (!(await permissionsEvaluator.evaluateAnonymous(obj, act))) {
                return res.status(401).send()
            }
        }

        await Bootstrap.setLocalUser(req)

        next()
    }

    private static isAuthenticatedUser(req: Request): boolean {
        return !!req.session.userInfo && !!req.session?.authed
    }

    private static async setLocalUser(req: Request) {
        const { userInfo } = req.session

        if (Bootstrap.isAuthenticatedUser(req) && userInfo) {
            req.locals = {} as never

            req.locals.user = (await new UserFactory().findUserById(
                userInfo.id,
            )) as User
        }
    }
}
