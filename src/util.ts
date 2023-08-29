import * as childProcess from "child_process"

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
