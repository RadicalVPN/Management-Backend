import crypto from "crypto"
import util from "util"

interface IHashResult {
    salt: string
    hash: string
}

export class CommonHashing {
    static pbkdf2Config = {
        iterations: 210_000,
        keyLen: 64,
        digest: "sha512",
    }

    static async hashString(
        str: string,
        encoding: BufferEncoding = "hex",
    ): Promise<IHashResult> {
        const salt = crypto.randomBytes(64)
        const hash = await this.generatePbkfs2Hash(Buffer.from(str), salt)

        return {
            salt: salt.toString(encoding),
            hash: hash.toString(encoding),
        }
    }

    static async generatePbkfs2Hash(password: Buffer, salt: Buffer) {
        const pbkdf2 = util.promisify(crypto.pbkdf2)

        return await pbkdf2(
            password,
            salt,
            this.pbkdf2Config.iterations,
            this.pbkdf2Config.keyLen,
            this.pbkdf2Config.digest,
        )
    }
}
