import { Router } from "express"
import app from "../../server"

export default Router({ mergeParams: true })
    .post(
        "/authorize",
        async (req, res, next) => await app.oauth.authorize()(req, res, next),
    )
    .post(
        "/token",
        async (req, res, next) => await app.oauth.token()(req, res, next),
    )
