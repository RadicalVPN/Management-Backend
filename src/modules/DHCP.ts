import { IPv4CidrRange, IPv6CidrRange } from "ip-num"
import { config } from "../config"
import { db } from "../database"
import { Redis } from "./Redis"

export enum DhcpIpType {
    V4,
    V6,
}

export class DHCP {
    private ipRange: IPv4CidrRange | IPv6CidrRange

    constructor(readonly type: DhcpIpType) {
        const ipRangeT = type === DhcpIpType.V4 ? IPv4CidrRange : IPv6CidrRange
        // @ts-ignore
        const cidrRange = config.VPN.IP_POOLS[DhcpIpType[this.type]] as string
        this.ipRange = ipRangeT.fromCidr(cidrRange)
    }

    async getUsedAddresses(): Promise<string[]> {
        const type = this.type === DhcpIpType.V4 ? "ipv4" : "ipv6"

        const usedIps = await db.table("vpns").select(type)
        return usedIps.map((data) => data[type])
    }

    async pop() {
        const redis = await Redis.getInstance()
        const cacheKey = this.getCacheKey()

        let ip: string = (await redis.sPop(cacheKey)) as any

        if (!ip) {
            const newIps = await this.fill()
            if (newIps === 0) {
                throw new Error("No more ips available")
            }

            ip = (await redis.sPop(cacheKey)) as any
        }

        console.log(`Reserved ip ${ip} - ${cacheKey}`)

        return ip
    }

    async fill() {
        const redis = await Redis.getInstance()
        const typeStr = this.getCacheKey()

        const usedAddresses = await this.getUsedAddresses()
        const validIps = this.ipRange
            .take(this.ipRange.getSize())
            .map((ip) => ip.toString())
            .filter((ip) => !usedAddresses.includes(ip))

        const addedIps = await redis.sAdd(typeStr, validIps)

        console.log(
            `added ${addedIps} new ips in dhcp pool for ip type: ${typeStr}`,
        )

        return addedIps
    }

    private getCacheKey() {
        return `dhcp:ips:${DhcpIpType[this.type].toLowerCase()}`
    }
}
