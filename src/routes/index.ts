import { Router } from "express"
import { authenticate } from "../middleware/authenticate"
import app from "../server"
import authRouter from "./auth/index"
import configurationRouter from "./configuration/index"
import daemonRouter from "./daemon/index"
import oauth2Router from "./oauth2/index"
import serverRouter from "./server/index"
import totpRouter from "./totp/index"
import userRouter from "./user/index"
import vpnRouter from "./vpn/index"

export default Router({ mergeParams: true })
    .use(
        async (req, res, next) =>
            await app.oauth.authenticate()(req, res, next),
    )
    .use("/api/:version/auth", authRouter)
    .use("/api/:version/configuration", configurationRouter)
    .use(authenticate)
    .use("/api/:version/oauth2", oauth2Router)
    .use("/api/:version/internal", daemonRouter)
    .use("/api/:version/vpn", vpnRouter)
    .use("/api/:version/auth/totp", totpRouter)
    .use("/api/:version/server", serverRouter)
    .use("/api/:version/user", userRouter)
