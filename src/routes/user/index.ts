import { Router } from "express"
import { UserError } from "../../modules/common/UserError"
import { User } from "../../modules/user/user"
import { JSONSchemaValidator } from "../../schema-validator"

export default Router({ mergeParams: true }).put(
    "/username",
    async (req, res, next) => {
        console.log(req.locals)
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
    },
)
