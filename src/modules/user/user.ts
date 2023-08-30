export interface UserData {
    id: number
    username: string
    email: string
    passwordHash: string
    passwordSalt: string
    active: number
    createdAt: string
    updatedAt: string
}

export class User {
    data: UserData

    constructor(data: UserData) {
        this.data = data
    }
}
