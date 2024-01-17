import { Router } from "express"
import { WebAuthn } from "../../modules/auth/webauthn/webauthn-core"

export default Router({ mergeParams: true })
    .get("/webauthn/challenge", async (req, res, next) => {
        const webauthn = new WebAuthn(req.session)
        const challenge = await webauthn.generateChallenge()

        res.send({
            challenge: challenge,
        })
    })
    .put("/webauthn/login", async (req, res, next) => {
        const webauthn = new WebAuthn(req.session, req.locals.user)

        const result = await webauthn.verifyAuthentification(req.body)
        if (!result.success) {
            res.status(400).send(result)
        }

        res.send()
    })
