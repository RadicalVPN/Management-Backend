import { config } from "./config"
import * as util from "./util"
import express from "express"
import mainRouter from "./routes/index"
import expressSession from "express-session"
import RedisStore from "connect-redis"
import { createClient } from "redis"
;(async () => {
    try {
        const wgVersion = (await util.exec("wg --version")).split(" ")[1]
        console.log(`Found wireguard installation -> ${wgVersion}`)
    } catch (err) {
        console.log("No valid wireguard installation found. Exiting..")
        process.exit(1)
    }

    const app = express()

    let redisClient = createClient()
    redisClient.connect().catch(console.error)

    // Initialize store.
    let redisStore = new RedisStore({
        client: redisClient,
        prefix: "radical_vpn:session:",
    })

    //register middlewares
    let sessionConfig: expressSession.SessionOptions = {
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

    //register main router
    app.use(mainRouter)

    app.listen(config.SERVER.HTTP_PORT, () => {
        console.log(
            `Started Radical VPN Backend Server on 127.0.0.1:${config.SERVER.HTTP_PORT}`,
        )
    })
})()
