import { Router } from "express"
import { NodeFactory } from "../../modules/nodes/node-factory"

export default Router({ mergeParams: true }).get("/", async (req, res) => {
    const nodes = await new NodeFactory().getAll()

    res.send(
        nodes.map((node) => {
            return {
                hostname: node.hostname,
                country: node.country,
                city: node.city,
            }
        }),
    )
})
