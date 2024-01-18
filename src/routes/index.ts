import { Router } from "express"
import app from ".."
import authRouter from "./auth/index"
import webAuthnLoginRouter from "./auth/webauthn-login"
import authInfoRouter from "./authInfo/index"
import configurationRouter from "./configuration/index"
import daemonRouter from "./daemon/index"
import oauth2Router from "./oauth2/index"
import passkeyRouter from "./passkey/index"
import serverRouter from "./server/index"
import totpRouter from "./totp/index"
import userRouter from "./user/index"
import webAuthnRegistrationRouter from "./user/webauthn-registration"
import vpnRouter from "./vpn/index"

export default Router({ mergeParams: true })
    .use("/api/:version/auth", authInfoRouter, authRouter, webAuthnLoginRouter)
    .use("/api/:version/configuration", configurationRouter)
    .use("/api/:version/oauth2", oauth2Router)
    .use(
        async (req, res, next) =>
            await app.oauth.authenticate({
                allowBearerTokensInQueryString: true,
            })(req, res, next),
    )
    .get("/api/:version/me", authInfoRouter)
    .use("/api/:version/internal", daemonRouter)
    .use("/api/:version/vpn", vpnRouter)
    .use("/api/:version/auth/totp", totpRouter)
    .use("/api/:version/server", serverRouter)
    .use("/api/:version/user", userRouter, webAuthnRegistrationRouter)
    .use("/api/:version/passkey", passkeyRouter)
