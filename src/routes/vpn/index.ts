import { Router } from "express"
import { VPNFactory } from "../../modules/vpn/vpn-factory"
import { JSONSchemaValidator } from "../../schema-validator"

export default Router({ mergeParams: true })
    .get("", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)

        const vpns = await Promise.all(
            (await vpnFactory.getAll()).map(async (vpn) => vpn.getInfo()),
        )

        res.send(vpns)
    })
    .put("", async (req, res, next) => {
        const data = req.body
        const schema = await JSONSchemaValidator.create()
        const vpnFactory = new VPNFactory(req.locals.user.userData)

        const errors = schema.validate(
            "http://radicalvpn.com/schemas/vpn/create",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        await vpnFactory.add(data.alias)

        res.send()
    })
    .delete("/:id", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) return res.status(404).send()

        await vpnFactory.delete(req.params.id)

        res.send()
    })
    .get("/:id", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) return res.status(404).send()

        res.send(await vpn.getInfo())
    })
    .get("/:id/config", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) return res.status(404).send()

        res.send(vpn.generateClientConfig())
    })
