import { Router } from "express"
import { WebAuthn } from "../../modules/auth/webauthn/webauthn-core"
import { Session } from "../../modules/session"
import { UserFactory } from "../../modules/user/user-factory"

export default Router({ mergeParams: true })
    .get("/webauthn/challenge", async (req, res, next) => {
        const webauthn = new WebAuthn(req.session)
        const challenge = await webauthn.generateChallenge()

        res.send({
            challenge: challenge,
        })
    })
    .put("/webauthn/login", async (req, res, next) => {
        const webauthn = new WebAuthn(req.session)
        const session = new Session()

        const result = await webauthn.verifyAuthentification(req.body)
        if (!result.success) {
            res.status(400).send(result)
        }

        const user = await new UserFactory().findUserById(result.userId!)

        if (!user) {
            console.error("failed to find user after webauthn login", result)
            return res.status(500).send()
        }

        session.prepareUserSession(req, user)

        res.send(result)
    })
