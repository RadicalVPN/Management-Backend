import { Router } from "express"
import { UserError } from "../../modules/common/user-error"
import { User } from "../../modules/user/user"
import { UserFactory } from "../../modules/user/user-factory"
import { JSONSchemaValidator } from "../../schema-validator"

export default Router({ mergeParams: true })
    .put("/username", async (req, res, next) => {
        const data = req.body
        const schema = new JSONSchemaValidator()
        const user = new User(req.locals.user.userData)

        const errors = schema.validate(
            "http://radicalvpn.com/schemas/update_username",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        try {
            await user.updateUsername(data.username)

            //make sure to update the session
            if (req.session.userInfo?.username) {
                req.session.userInfo.username = data.username
            }
        } catch (e: UserError | any) {
            if (e instanceof UserError) {
                return res.status(400).send(e.message)
            } else {
                return res.status(500).send(e.message)
            }
        }

        res.send()
    })
    .put("/password", async (req, res, next) => {
        const data = req.body
        const schema = new JSONSchemaValidator()
        const user = new User(req.locals.user.userData)

        const errors = schema.validate(
            "http://radicalvpn.com/schemas/update_password",
            data,
        )

        if (!errors.valid) {
            return res.status(400).send(errors)
        }

        const userFactory = new UserFactory()
        const authenticated = await userFactory.authenticate(
            user.userData.email,
            data.oldPassword,
        )

        if (!authenticated) {
            return res.status(401).send("invalid password")
        }

        await user.updatePassword(data.newPassword)

        res.send()
    })
