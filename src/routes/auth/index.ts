import express, { Router } from "express"
import { JSONSchemaValidator } from "../../schema-validator"
import { User, UserCreationError } from "../../modules/user"

export default Router({ mergeParams: true })
    .get("/", async (req, res, next) => {
        const user = new User()
        console.log(
            "authentification result",
            await user.authenticate("test@test.test", "test_password"),
        )

        //setup initial session data
        if (req.session.authed === undefined) {
            req.session.authed = false
        }

        res.send({
            authed: req.session.authed,
        })
    })
    .post("/", async (req, res, next) => {
        const schema = await JSONSchemaValidator.create()
        const errors = schema.validate(
            "http://radicalvpn.com/schemas/login",
            req.body,
        )

        const user = new User()

        try {
            await user.add("johann", "test@test.test", "test_password")
        } catch (err) {
            if (err instanceof UserCreationError) {
                return res.status(400).send({
                    name: "UserCreationError",
                    message: err.message,
                })
            }
        }

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        if (req.session.authed === true) {
            return res.status(400).send("already authenticated")
        }

        req.session.authed = true

        res.send()
    })
