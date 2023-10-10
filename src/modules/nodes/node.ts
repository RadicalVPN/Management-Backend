import { NodeAvailabilityChecker } from "./node-availability-check"

export interface VpnNode {
    id: string
    hostname: string
    country: string
    city: string
    internal_ip: string
    external_ip: string
    public_key: string
    private_key: string
}

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
            internal_ip: this.data.internal_ip,
            external_ip: this.data.external_ip,
            public_key: this.data.public_key,
            online: await NodeAvailabilityChecker.isNodeActive(this),
        }
    }
}
