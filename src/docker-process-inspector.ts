import fs from "fs"

export class DockerProcessInspector {
    private static hasDockerEnv(): boolean {
        try {
            fs.statSync("/.dockerenv")
            return true
        } catch {
            return false
        }
    }

    private static hasDockerCGroup(): boolean {
        try {
            return fs
                .readFileSync("/proc/self/cgroup", "utf8")
                .includes("docker")
        } catch {
            return false
        }
    }

    static isDocker(): boolean {
        return this.hasDockerCGroup() || this.hasDockerEnv()
    }
}
