import "express-session"

declare module "express-session" {
    interface SessionData {
        authed: boolean
        userInfo: {
            email: string
            username: string
            id: string
            active: boolean
            scopes: string[]
        }
    }
}
