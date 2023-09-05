import { User } from "../../modules/user/user"

declare global {
    namespace Express {
        interface Request {
            locals: {
                user: User
            }
        }
    }
}
