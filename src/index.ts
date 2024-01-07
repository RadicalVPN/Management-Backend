import RedisStore from "connect-redis"
import express from "express"
import expressSession from "express-session"
import morgan from "morgan"
import { uid } from "uid/secure"
import { config } from "./config"
import { DockerProcessInspector } from "./docker-process-inspector"
import { PrometheusServiceDiscovery } from "./internal-services/prometheus-service-discovery"
import { Metrics } from "./metrics"
import { Bootstrap } from "./modules/auth/bootstrap"
import { EmailQueueWorker } from "./modules/common/email/email-queue-worker"
import { NodeAvailabilityChecker } from "./modules/nodes/node-availability-check"
import { NodeFactory } from "./modules/nodes/node-factory"
import { OAuthModel } from "./modules/oauth/lib/oauth-model"
import { OAuth } from "./modules/oauth/lib/oauth-server"
import { Redis } from "./modules/redis"
import { ConfigManager } from "./modules/server/config-manager"
import { VpnGarbageCollector } from "./modules/vpn-gc"
import mainRouter from "./routes/index"
import { JSONSchemaValidator } from "./schema-validator"
import * as util from "./util"

const app = express()
;(async () => {
    console.log("starting radical vpn backend server")

    try {
        const wgVersion = (await util.exec("wg --version")).split(" ")[1]
        console.log(`Found wireguard installation -> ${wgVersion}`)
    } catch (err) {
        console.log("No valid wireguard installation found. Exiting..")
        process.exit(1)
    }

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
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: config.SERVER.NODE_ENV === "production",
        },
        genid(req) {
            const email = req?.body?.email

            //usually we only generate a session on login
            if (email) {
                return `${email}:${uid(24)}}`
            } else {
                return uid(24)
            }
        },
    }
    if (app.get("env") === "production") {
        app.set("trust proxy", 1)

        // @ts-ignore
        sessionConfig.cookie.secure = true
    }

    //make sure to parse json body before session middleware!
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.use(expressSession(sessionConfig))

    app.use(morgan("dev"))

    app.use(Bootstrap.middleware)

    app.oauth = new OAuth({
        model: new OAuthModel(),
        authenticateHandler: {
            handle: (req: express.Request, res: express.Response) =>
                req?.locals?.user?.userData,
        },
    })

    //register main router
    app.use(mainRouter)

    app.use((req, res, next) => {
        res.status(404).json({
            error: "Not Found",
        })
    })

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

    if (DockerProcessInspector.isDocker()) {
        console.log("Starting database migration")

        console.log(await util.exec("npx knex migrate:latest --env production"))
    }

    await NodeAvailabilityChecker.startCheckInterval()
    new VpnGarbageCollector()
    new EmailQueueWorker().startWorker()
    //new InternalMetrics().start()

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

export default app
