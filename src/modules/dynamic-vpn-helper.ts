import { User, UserData } from "./user/user"
import { VPNFactory } from "./vpn/vpn-factory"

export class DynamicVpnHelper extends User {
    vpnFactory: VPNFactory

    constructor(user: UserData) {
        super(user)
        this.vpnFactory = new VPNFactory(this.userData)
    }

    async getCurrentlyActiveVpns() {
        const vpns = await this.vpnFactory.getAll(true)

        return (
            await Promise.all(
                vpns.map(async (vpn) => {
                    const data = await vpn.getLiveDataFromRedis()
                    const connected = data?.connected ?? false

                    return connected ? vpn : undefined
                }),
            )
        ).filter(Boolean)
    }
}
