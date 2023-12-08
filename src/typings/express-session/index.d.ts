import "express-session"
import { UserData } from "../../modules/user/user"

declare module "express-session" {
    interface SessionData {
        authed: boolean
        userInfo: UserData
    }
}
