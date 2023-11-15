import RedisStore from "connect-redis"
import express from "express"
import expressSession from "express-session"
import morgan from "morgan"
import { config } from "./config"
import { PrometheusServiceDiscovery } from "./internal-services/prometheus-service-discovery"
import { Metrics } from "./metrics"
import { Redis } from "./modules/Redis"
import { NodeFactory } from "./modules/nodes/node-factory"
import { ConfigManager } from "./modules/server/config-manager"
import mainRouter from "./routes/index"
import { JSONSchemaValidator } from "./schema-validator"
import * as util from "./util"
;(async () => {
    console.log("starting radical vpn backend server")

    try {
        const wgVersion = (await util.exec("wg --version")).split(" ")[1]
        console.log(`Found wireguard installation -> ${wgVersion}`)
    } catch (err) {
        console.log("No valid wireguard installation found. Exiting..")
        process.exit(1)
    }

    const app = express()
    const redis = await Redis.getInstance()

    // Initialize store.
    const redisStore = new RedisStore({
        client: redis,
        prefix: "radical_vpn:session:",
    })

    //register middlewares
    const sessionConfig: expressSession.SessionOptions = {
        store: redisStore,
        secret: config.SERVER.SESSION_SECRET,
        name: "RADICAL_SESSION_ID",
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false,
        },
    }
    if (app.get("env") === "production") {
        app.set("trust proxy", 1)

        // @ts-ignore
        sessionConfig.cookie.secure = true
    }

    app.use(expressSession(sessionConfig))
    app.use(express.json())
    app.use(morgan("dev"))

    //register main router
    app.use(mainRouter)

    await ConfigManager.publishServerConfig("all")

    const nodes = await new NodeFactory().getAll()
    await Promise.all(
        nodes.map(async (_node) => {
            const hostname = _node.data.hostname
            await redis.publish(`start_interface:${hostname}`, "")
            console.log(`starting vpn node ${hostname}`)
        }),
    )

    await JSONSchemaValidator.setup()

    app.listen(config.SERVER.HTTP_PORT, () => {
        console.log(
            `Started Radical VPN Backend Server on 127.0.0.1:${config.SERVER.HTTP_PORT}`,
        )
    })

    const internalServices = [new Metrics(), new PrometheusServiceDiscovery()]
    internalServices.forEach((service) => {
        service.start()
    })
})().catch((err) => {
    console.error("Failed to start RadicalVPN Server Worker", err)
    process.exit(1)
})
