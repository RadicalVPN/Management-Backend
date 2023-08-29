import { Router } from "express"
import authRouter from "./auth/index"

export default Router({ mergeParams: true }).use(
    "/api/:version/auth",
    authRouter,
)
