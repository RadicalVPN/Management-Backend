import * as childProcess from "child_process"
import * as crypto from "crypto"
import * as fs from "fs/promises"

export function exec(cmd: string, log: boolean = true): Promise<string> {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            cmd,
            {
                shell: "bash",
            },
            (err, out) => {
                if (err) return reject(err)
                return resolve(out.trim())
            },
        )
    })
}

export async function fileExists(path: string) {
    return !!(await fs.stat(path).catch((e) => false))
}

export function md5(input: string) {
    return crypto.createHash("md5").update(input).digest("hex")
}
