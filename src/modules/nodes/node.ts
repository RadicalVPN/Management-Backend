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
            country: this.data.country,
            city: this.data.city,
            country_code: this.data.country_code,
            country_name: this.data.country_name,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            internal_ip: this.data.internal_ip,
            external_ip: this.data.external_ip,
            public_key: this.data.public_key,
            online: await NodeAvailabilityChecker.isNodeActive(this),
        }
    }
}
