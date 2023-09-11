import { Router } from "express"
import totp from "totp-generator"
import { QRCodeGeneartor } from "../../modules/QRCodeGenerator"
import { User } from "../../modules/user/user"
import { UserFactory } from "../../modules/user/user-factory"

export default Router({ mergeParams: true })
    //step 1: user gets the qrcode after confor,ing the password
    .get("/qrcode", async (req, res, next) => {
        const user = new User(req.locals.user.userData)
        const password = req.query.password as string | undefined
        const secret = await user.generateTotpSecret()

        if (!password) {
            return res.status(400).send()
        }

        const authed = await new UserFactory().authenticate(
            user.userData.email,
            password,
        )
        if (!authed) {
            return res.status(401).send("invalid password")
        }

        const qrCodeGenerator = new QRCodeGeneartor()
        const qr = await qrCodeGenerator.generateQrCode(
            UserFactory.computeTotpUri(
                secret,
                user.userData.email,
                user.userData.username,
            ),
        )
        res.contentType("png").send(qr)
    })
    //step 2: user scans the qr code, and enters the 6 digit token, after confirmation: totp ready
    .get("/verify", async (req, res, next) => {
        const user = new User(req.locals.user.userData)
        const userToken = req.query.token
        const secret = await user.getTotpSecret()

        if (!userToken) {
            return res.status(400).send()
        }

        if (!secret) {
            return res.status(500).send()
        }

        if (totp(secret, { timestamp: Date.now() }) !== userToken) {
            return res.status(401).send("invalid totp token")
        }

        await user.confirmTotp()

        res.send()
    })
