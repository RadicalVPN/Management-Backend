import { OAuth2Info } from "./oauth2-factory"

export class OAuth2Client {
    readonly data: OAuth2Info

    constructor(data: OAuth2Info) {
        this.data = data
    }

    getInfo() {
        return {
            clientName: this.data.clientName,
        }
    }
}
