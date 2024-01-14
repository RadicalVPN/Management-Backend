import { Router } from "express"
import { WebAuthn } from "../../modules/auth/webauthn/webauthn-core"

export default Router({ mergeParams: true })
    .get("/webauthn/challenge", async (req, res, next) => {
        const webauthn = new WebAuthn(req.locals.user)

        res.send({
            challenge: await webauthn.generateChallenge(),
        })
    })
    .put("/webauthn/verify", async (req, res, next) => {
        const webauthn = new WebAuthn(req.locals.user)

        const result = await webauthn.verifyChallenge(req.body)

        if (result.success) {
            res.send(result)
        } else {
            res.status(400).send(result)
        }
    })