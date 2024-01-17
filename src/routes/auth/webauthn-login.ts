import { Router } from "express"
import { WebAuthn } from "../../modules/auth/webauthn/webauthn-core"

export default Router({ mergeParams: true }).get(
    "/webauthn/challenge",
    async (req, res, next) => {
        const webauthn = new WebAuthn(req.locals.user, req.session)
        const challenge = await webauthn.generateChallenge()

        res.send({
            challenge: challenge,
        })
    },
)
