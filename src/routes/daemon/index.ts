import { Router } from "express"
import { config } from "../../config"
import { DynamicVpnHelper } from "../../modules/dynamic-vpn-helper"
import { NodeFactory } from "../../modules/nodes/node-factory"
import { VPNFactory } from "../../modules/vpn/vpn-factory"
import { JSONSchemaValidator } from "../../schema-validator"

export default Router({ mergeParams: true }).put(
    "/dynamic_vpn",
    async (req, res, next) => {
        const data = req.body
        const schema = new JSONSchemaValidator()
        const userData = req.locals.user.userData
        const vpnFactory = new VPNFactory(userData)

        const errors = schema.validate(
            "http://radicalvpn.com/schemas/vpn/create/dynamic",
            data,
        )

        if (errors.valid === false) {
            return res.status(400).send(errors)
        }

        const dynamicVpnHeloer = new DynamicVpnHelper(userData)
        const connectedPeers = (await dynamicVpnHeloer.getCurrentlyActiveVpns())
            .length

        if (connectedPeers >= config.VPN.DYNAMIC_CONNECTION_LIMIT) {
            return res.status(403).send("vpn connection limit")
        }

        const node = await new NodeFactory().get(data.node)
        if (!node) {
            return res.status(400).send("invalid vpn node id")
        }

        const newId = await vpnFactory.add(crypto.randomUUID(), node, true)
        const newVpn = await vpnFactory.get(newId, true)

        if (!newVpn) {
            return res.status(500).send("failed to create vpn")
        }

        res.send(await newVpn.generateClientConfig())
    },
)
