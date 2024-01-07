import * as OAuth2Server from "@node-oauth/oauth2-server"
import { OAuth } from "../../modules/oauth/lib/oauth-server"
import { User } from "../../modules/user/user"

declare global {
    namespace Express {
        interface Application {
            oauth: OAuth
        }

        interface Request {
            locals: {
                user: User
                oauth: {
                    token: OAuth2Server.Token
                }
            }
        }
    }
}
