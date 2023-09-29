import * as dotenv from "dotenv"
import { readFileSync } from "fs"

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
            parseEnviromentVariable("RADICAL_VPN_BACKEND_HTTP_PORT", "8080"),
        ),
        SESSION_SECRET: parseEnviromentVariable(
            "RADICAL_VPN_BACKEND_SESSION_SECRET",
            "insecure",
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
    VPN: {
        IP_POOLS: {
            V4: "10.0.0.2/16",
            V6: "2001:100:100:100::100:1/112",
        },
        WG_SERVER: {
            IPS: {
                V4: "10.0.0.1/16",
                V6: "2001:100:100:100:100::0/112",
            },
        },
    },
}
