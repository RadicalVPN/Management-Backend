import knex from "knex"
import serverConfig from "../knexfile"

export const db = knex(serverConfig.production)
