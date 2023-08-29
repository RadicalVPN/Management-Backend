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
}
