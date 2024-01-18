import { Router } from "express"
import { PasskeyFactory } from "../../modules/passkeys/passkey-factory"

export default Router({ mergeParams: true }).get("", async (req, res, next) => {
    const passkeyFactory = new PasskeyFactory(req.locals.user.userData)
    const passKeys = (await passkeyFactory.getAll()).map((passkey) =>
        passkey.getInfo(),
    )

    res.send(passKeys)
})
