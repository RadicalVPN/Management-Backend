import { Router } from "express"
import { User } from "../../modules/user/user"
import { UserFactory } from "../../modules/user/user-factory"
import { sha256 } from "../../util"

export default Router({ mergeParams: true }).get(
    "/",
    async (req, res, next) => {
        if (!req.session?.authed) {
            return res.status(401).send()
        }

        if (req.session.userInfo?.active === false) {
            return res.status(400).send("user locked")
        }

        const user = (await new UserFactory().findUserByName(
            req.session?.userInfo?.username || "",
        )) as User
        if (!user) {
            return res.status(500).send()
        }

        res.send({
            ...req.session.userInfo,
            emailSha256: sha256(user.userData.email.toLowerCase()),
            totp: await user.isTotpEnabled(),
            registered: user.userData.createdAt,
        })
    },
)
