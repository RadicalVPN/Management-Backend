import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import { cpus } from "os"

dotenv.config()

function isDockerSecret(variable?: string): boolean {
    return variable?.startsWith("/run/secrets/") || false
}

function parseEnviromentVariable(envVariable: string, defaultValue?: string) {
    const env = process.env[envVariable]

    if (!env && !defaultValue) {
        throw new Error(`Failed to load enviroment variable ${envVariable}`)
    }

    const envData =
        env && isDockerSecret(env) ? readFileSync(env, "utf-8") : env
    return envData || defaultValue || ""
}

export const config = {
    SERVER: {
        HTTP_PORT: parseInt(
            parseEnviromentVariable("RADICAL_VPN_BACKEND_HTTP_PORT", "80"),
        ),
        SESSION_SECRET: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_SESSION_SECRET",
            "insecure",
        ),
        WORKER: parseInt(
            parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_WORKER",
                cpus().length.toString(),
            ),
        ),
    },
    POSTGRES: {
        USERNAME: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_POSTGRES_USERNAME",
        ),
        PASSWORD: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_POSTGRES_PASSWORD",
        ),
        HOST: parseEnviromentVariable("RADICAL_VPN_BACKEND_POSTGRES_HOST"),
        PORT: parseInt(
            parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_POSTGRES_PORT",
                "5432",
            ),
        ),
        DATABASE: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_POSTGRES_DATABASE",
        ),
    },
    REDIS: {
        URI: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_REDIS_URI",
            "redis://127.0.0.1:6379",
        ),
    },
    PROMETHEUS: {
        HOST: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_PROMETHEUS_HOST",
            "localhost:9090",
        ),
    },
    VPN: {
        IP_POOLS: {
            V4: "10.0.0.2/16",
            V6: "fd8f:a1fb:a69e::2/112",
        },
        NODE_AVAILABILITY_CHECK_INTERVAL_SEC: parseInt(
            parseEnviromentVariable(
                "NODE_AVAILABILITY_CHECK_INTERVAL_SEC",
                "10",
            ),
        ),
        VPN_BUFFER_CNT: parseInt(
            parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_VPN_BUFFER_CNT",
                "1024",
            ),
        ),
        DYNAMIC_CONNECTION_LIMIT: parseInt(
            parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_DYNAMIC_CONNECTION_LIMIT",
                "5",
            ),
        ),
    },
    NODE_PROMETHEUS: {
        NODE_EXPORTER_PORT: parseEnviromentVariable(
            "NODE_EXPORTER_PORT",
            "6969",
        ),
        PROCESS_EXPORTER_PORT: parseEnviromentVariable(
            "PROCESS_EXPORTER_PORT",
            "1337",
        ),
    },
}
