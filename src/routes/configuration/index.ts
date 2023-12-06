import { Router } from "express"
import { config } from "../../config"

export default Router({ mergeParams: true }).get(
    "/cloudflare/turnstile",
    (req, res) => {
        res.send({
            siteKey: config.ClOUDFLARE.TURNSTILE.SITE_KEY,
        })
    },
)
