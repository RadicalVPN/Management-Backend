import { Router } from "express"
import { Metrics } from "../../metrics"
import { QRCodeGeneartor } from "../../modules/QRCodeGenerator"
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
    .get("/:id/qrcode", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        const qrCodeGenerator = new QRCodeGeneartor()

        if (!vpn) return res.status(404).send()

        const qr = await qrCodeGenerator.generateQrCode(
            vpn.generateClientConfig(),
        )
        res.contentType("png").send(qr)
    })
    .post("/:id/toggle", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) return res.status(404).send()

        await vpn.toggle()

        res.send()
    })
    .get("/:id/config", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) return res.status(404).send()

        res.send(vpn.generateClientConfig())
    })
    .get("/prometheus/metrics", async (req, res, next) => {
        const start = Date.now() / 1000 - 30 * 60 // 30 minutes
        const end = Date.now() / 1000 // now

        //down
        const txMetrics = await Metrics.getMetricsFromPrometheus(
            `irate(wireguard_tx{userId="${req.session.userInfo?.id}"}[1m])`,
            start,
            end,
        )

        //up
        const rxMetrics = await Metrics.getMetricsFromPrometheus(
            `irate(wireguard_rx{userId="${req.session.userInfo?.id}"}[1m])`,
            start,
            end,
        )

        res.send({
            labels: txMetrics.map((metric: any) => metric.label),
            datasets: [
                {
                    label: "Traffic Down",
                    backgroundColor: "primary",
                    data: txMetrics.map((metric: any) => metric.value),
                },
                {
                    label: "Traffic Up",
                    backgroundColor: "secondary",
                    data: rxMetrics.map((metric: any) => metric.value),
                },
            ],
        })
    })
