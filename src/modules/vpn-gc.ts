import { Job } from "bullmq"
import { config } from "../config"
import { GenericEventQueue } from "./generic-event-queue"
import { User } from "./user/user"
import { UserFactory } from "./user/user-factory"
import { VPN } from "./vpn/vpn"
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
            let vpnsToDelete: VPN[] = []
            await Promise.all(
                vpns.map(async (_vpn) => {
                    const vpn = new VPN(_vpn.data)
                    const redisData = await vpn.getLiveDataFromRedis()

                    if (!redisData?.connected) {
                        vpnsToDelete.push(vpn)
                    }
                }),
            )

            //delete 80% of the vpns, calculate 80% from total user's vpns
            const toDelete = vpnsToDelete.slice(
                0,
                Math.floor(vpnsToDelete.length * 0.8),
            )
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
