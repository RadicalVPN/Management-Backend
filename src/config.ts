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
    VPN_ENDPOINT: parseEnviromentVariable("RADICAL_VPN_ENDPOINT", "127.0.0.1"),
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
        PATH: "/etc/wireguard",
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
        SECRETS: {
            PRIVATE_KEY: parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_VPN_SECRETS_PRIVATE_KEY",
                "4FIUiYUvXrVqiZ2C9K+GtYo6Oo2vQLgj5qX3Nmo5lUM=",
            ),
            PUBLIC_KEY: parseEnviromentVariable(
                "RADICAL_VPN_BACKEND_VPN_SECRETS_PUBLIC_KEY",
                "a4nE00KqoC5ibugA//Wi+ImOjmGFF+BCRW1V1NS0EBk=",
            ),
        },
    },
}
