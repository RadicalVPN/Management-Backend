import { Router } from "express"
import authRouter from "./auth/index"

export default Router({ mergeParams: true })
    .use("/api/:version/auth", authRouter)
    .use((req, res, next) => {
        //authenticiation middleware, next routers need all a signed in user!
        if (!req.session.authed) {
            return res.status(401).send("not authenticated")
        }

        if (!req.session.userInfo?.active) {
            return res.status(401).send("user locked")
        }

        next()
    })
