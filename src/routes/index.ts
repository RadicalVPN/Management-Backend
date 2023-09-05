import { Router } from "express"
import authRouter from "./auth/index"
import { authenticate } from "../middleware/authenticate"

export default Router({ mergeParams: true })
    .use("/api/:version/auth", authRouter)
    .use(authenticate)
