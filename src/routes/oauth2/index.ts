import { Router } from "express"
import { OAuth2ClientFactory } from "../../modules/oauth/oauth2-factory"
import app from "../../server"

export default Router({ mergeParams: true })
    .post(
        "/token",
        async (req, res, next) => await app.oauth.token()(req, res, next),
    )
    .get("/client/:clientId", async (req, res, next) => {
        const client = await new OAuth2ClientFactory().get(req.params.clientId)

        if (!client) {
            return res.status(404).send()
        }

        res.send(client.getInfo())
    })
    .post(
        "/authorize",
        async (req, res, next) => await app.oauth.authorize()(req, res, next),
    )
