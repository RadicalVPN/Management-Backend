import type { Knex } from "knex"
import { config as serverConfig } from "./src/config"

export default {
    production: {
        client: "postgresql",
        connection: {
            database: serverConfig.POSTGRES.DATABASE,
            user: serverConfig.POSTGRES.USERNAME,
            password: serverConfig.POSTGRES.PASSWORD,
            host: serverConfig.POSTGRES.HOST,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
} as { [key: string]: Knex.Config }
