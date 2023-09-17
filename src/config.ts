import * as dotenv from "dotenv"

dotenv.config()

function parseEnviromentVariable(envVariable: string, defaultValue?: string) {
    const env = process.env[envVariable]

    if (!env && !defaultValue) {
        throw new Error(`Failed to load enviroment variable ${envVariable}`)
    }

    return env || defaultValue || ""
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
