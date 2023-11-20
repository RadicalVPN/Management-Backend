import { createHash } from "crypto"
import * as qrcode from "qrcode"
import { Redis } from "./redis"

export class QRCodeGeneartor {
    constructor(readonly margin = 2) {}

    async generateQrCode(input: string): Promise<Buffer> {
        const redis = await Redis.getInstance()

        const hash = createHash("md5").update(input).digest("hex")
        const cachedValue = await redis.get(this.computeCacheKey(hash))
        if (cachedValue) {
            return Buffer.from(cachedValue, "base64")
        }

        const qrCode = await qrcode.toBuffer(input, {
            margin: this.margin,
        })

        await redis.set(this.computeCacheKey(hash), qrCode.toString("base64"), {
            EX: 1 * 60 * 60 * 24, //1 day
        })
        return qrCode
    }

    private computeCacheKey(hash: string) {
        return `qrcode:${hash}`
    }
}
