import { Router } from "express"
import { config } from "../../config"
import { DynamicVpnHelper } from "../../modules/dynamic-vpn-helper"
import { NodeFactory } from "../../modules/nodes/node-factory"
import { VPNFactory } from "../../modules/vpn/vpn-factory"
import { JSONSchemaValidator } from "../../schema-validator"

interface IDynamicVpnRequestPayload {
    nodeLocation: string
    privacyFirewall: "basic" | "recommended" | "comprehensive" | "aggresive"
}

export default Router({ mergeParams: true }).put(
    "/dynamic_vpn",
    async (req, res, next) => {
        const data = req.body as IDynamicVpnRequestPayload
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

        const nodes = await new NodeFactory().getAllByLocation(
            data.nodeLocation,
        )

        if (nodes.length === 0) {
            return res.status(404).send("no nodes available")
        }

        //choose a random node
        const node = nodes[Math.floor(Math.random() * nodes.length)]

        const newId = await vpnFactory.add(crypto.randomUUID(), node, true)
        const newVpn = await vpnFactory.get(newId, true)

        if (!newVpn) {
            return res.status(500).send("failed to create vpn")
        }

        const configuration = await newVpn.generateClientConfig(
            config.PRIVACY_FIREWALL_IP_MAPPING[data.privacyFirewall],
        )

        //now we can delete the private key from the database safely
        await newVpn.deletePrivateKey()

        res.send(configuration)
    },
)
