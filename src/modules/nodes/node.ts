import { Redis } from "../redis"
import { NodeAvailabilityChecker } from "./node-availability-check"
import { VpnNode } from "./node-factory"

export class Node {
    readonly data: VpnNode

    constructor(data: VpnNode) {
        this.data = data
    }

    async getInfo() {
        return {
            id: this.data.id,
            hostname: this.data.hostname,
            city: this.data.city,
            country_name: this.data.country_name,
            country: this.data.country_code,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            internal_ip: this.data.internal_ip,
            external_ip: this.data.external_ip,
            public_key: this.data.public_key,
            location: this.data.node_location,
            online: await NodeAvailabilityChecker.isNodeActive(this),
            load: await this.getCurrentLoadFromRedis(),
        }
    }

    async getCurrentLoadFromRedis() {
        const redis = await Redis.getInstance()
        const data = await redis.get(
            `server-load-percent:${this.data.hostname}`,
        )

        if (!data) {
            return 0
        }

        return parseFloat(data)
    }
}
