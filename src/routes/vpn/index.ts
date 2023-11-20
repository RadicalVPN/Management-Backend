import { Router } from "express"
import { Metrics } from "../../metrics"
import { NodeFactory } from "../../modules/nodes/node-factory"
import { QRCodeGeneartor } from "../../modules/qr-code-generator"
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
        const schema = new JSONSchemaValidator()
        const vpnFactory = new VPNFactory(req.locals.user.userData)

        const errors = schema.validate(
            "http://radicalvpn.com/schemas/vpn/create",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        const node = await new NodeFactory().get(data.node)
        if (!node) {
            return res.status(400).send("invalid vpn node id")
        }

        await vpnFactory.add(data.alias, node)

        res.send()
    })
    .delete("/:id", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) {
            return res.status(404).send()
        }

        await vpnFactory.delete(req.params.id)

        res.send()
    })
    .get("/:id", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) {
            return res.status(404).send()
        }

        res.send(await vpn.getInfo())
    })
    .get("/:id/qrcode", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        const qrCodeGenerator = new QRCodeGeneartor()

        if (!vpn) {
            return res.status(404).send()
        }

        const qr = await qrCodeGenerator.generateQrCode(
            await vpn.generateClientConfig(),
        )
        res.contentType("png").send(qr)
    })
    .post("/:id/toggle", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) {
            return res.status(404).send()
        }

        await vpn.toggle()

        res.send()
    })
    .get("/:id/config", async (req, res, next) => {
        const vpnFactory = new VPNFactory(req.locals.user.userData)
        const vpn = await vpnFactory.get(req.params.id)
        if (!vpn) {
            return res.status(404).send()
        }

        res.send(await vpn.generateClientConfig())
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
    .get("/prometheus/metrics/day", async (req, res, next) => {
        const start = Date.now() / 1000 - 24 * 60 * 60 // 24 hours
        const end = Date.now() / 1000 // now

        //down
        const txMetrics = (
            await Metrics.getMetricsFromPrometheus(
                `wireguard_tx{userId="${req.session.userInfo?.id}"}`,
                start,
                end,
            )
        ).map((metric: any) => metric.value) as number[]

        const rxMetrics = (
            await Metrics.getMetricsFromPrometheus(
                `wireguard_rx{userId="${req.session.userInfo?.id}"}`,
                start,
                end,
            )
        ).map((metric: any) => metric.value) as number[]

        res.send({
            rx: rxMetrics[rxMetrics.length - 1] - rxMetrics[0] || 0,
            tx: txMetrics[txMetrics.length - 1] - txMetrics[0] || 0,
        })
    })
