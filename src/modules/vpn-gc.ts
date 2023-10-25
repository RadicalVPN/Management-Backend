import { Job } from "bullmq"
import { config } from "../config"
import { GenericEventQueue } from "./generic-event-queue"
import { User } from "./user/user"
import { UserFactory } from "./user/user-factory"
import { VPNFactory } from "./vpn/vpn-factory"

export class VpnGarbageCollector extends GenericEventQueue<User> {
    constructor() {
        super({ name: "vpn_gc", rescheduleTime: 5 * 60 * 1000, jobDelay: 500 })
    }

    async computeJob(job: Job<User>) {
        const username = job.data.userData.username

        console.log(`Computing job for user ${username}`)
        const vpnFactory = new VPNFactory(job.data.userData)
        const vpns = await vpnFactory.getAllDynamic()

        if (vpns.length >= config.VPN.DYNAMIC_BUFFERED_VPNS) {
            //delete 80% of the vpns, calculate 80% from total user's vpns
            const toDelete = vpns.slice(0, Math.floor(vpns.length * 0.8))
            const deletionCnt = await vpnFactory.deleteMultipleVpns(toDelete)

            console.log(
                `Deleted ${deletionCnt} dynamic vpns for user ${username}`,
            )
        }
    }

    async getItems(): Promise<User[]> {
        const users = await new UserFactory().getAll()
        return users
    }
}
