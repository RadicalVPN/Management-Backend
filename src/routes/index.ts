import { Router } from "express"
import { authenticate } from "../middleware/authenticate"
import authRouter from "./auth/index"
import totpRouter from "./totp/index"
import vpnRouter from "./vpn/index"

export default Router({ mergeParams: true })
    .use("/api/:version/auth", authRouter)
    .use(authenticate)
    .use("/api/:version/vpn", vpnRouter)
    .use("/api/:version/auth/totp", totpRouter)
