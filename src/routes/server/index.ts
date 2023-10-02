import { Router } from "express"
import { NodeFactory } from "../../modules/nodes/node-factory"

export default Router({ mergeParams: true }).get("/", async (req, res) => {
    const nodes = await new NodeFactory().getAll()
    const infos = await Promise.all(
        nodes.map(async (node) => await node.getInfo()),
    )

    res.send(infos)
})
