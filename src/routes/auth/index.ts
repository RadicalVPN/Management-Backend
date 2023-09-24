import { Router } from "express"
import totp from "totp-generator"
import { User } from "../../modules/user/user"
import { UserCreationError, UserFactory } from "../../modules/user/user-factory"
import { JSONSchemaValidator } from "../../schema-validator"

export default Router({ mergeParams: true })
    .get("/", async (req, res, next) => {
        if (!req.session?.authed) {
            return res.status(401).send()
        }

        if (req.session.userInfo?.active === false) {
            return res.status(400).send("user locked")
        }

        const user = (await new UserFactory().findUserByName(
            req.session?.userInfo?.username || "",
        )) as User
        if (!user) return res.status(500).send()

        res.send({
            ...req.session.userInfo,
            totp: await user.isTotpEnabled(),
        })
    })
    .post("/", async (req, res, next) => {
        if (req.session?.authed === true) {
            return res.status(400).send("already authenticated")
        }

        const data = req.body
        const schema = new JSONSchemaValidator()
        const errors = schema.validate(
            "http://radicalvpn.com/schemas/login",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        const userFactory = new UserFactory()
        const authenticated = await userFactory.authenticate(
            data.email,
            data.password,
        )

        if (!authenticated) return res.status(401).send("invalid credentials")

        const realUser = await userFactory.findUserByEmail(data.email)
        if (!realUser) return res.status(404).send("user not found")

        const totpToken = data.totpToken
        const totpRequired = await realUser.isTotpEnabled()
        if (totpRequired && !totpToken) {
            return res.status(401).send("totp required")
        }

        if (totpRequired && totpToken) {
            if (totp(await realUser.generateTotpSecret()) !== totpToken) {
                return res.status(401).send("invalid totp token")
            }
        }

        //..now we got our valid user object

        req.session.authed = true
        req.session.userInfo = {
            active: realUser.userData.active == 1,
            email: realUser.userData.email,
            username: realUser.userData.username,
            id: realUser.userData.id,
        }

        res.status(200).send()
    })
    .delete("", (req, res, next) => {
        if (!req.session?.authed) {
            return res.status(401).send()
        }

        req.session.destroy((err) => {
            console.log(err)
            res.status(200).send()
        })
    })
    .post("/register", async (req, res, next) => {
        const data = req.body
        const schema = new JSONSchemaValidator()
        const errors = schema.validate(
            "http://radicalvpn.com/schemas/register",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        const userFactory = new UserFactory()

        try {
            await userFactory.add(data.username, data.email, data.password)
        } catch (err) {
            if (err instanceof UserCreationError) {
                return res.status(400).send({
                    name: "UserCreationError",
                    message: err.message,
                })
            } else {
                console.error(err)
                return res.status(500).send("internal server error")
            }
        }

        res.send()
    })
