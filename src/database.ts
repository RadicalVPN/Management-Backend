import knex from "knex"

export const db = knex({
    client: "sqlite3", // or 'better-sqlite3'
    connection: {
        filename: "./dev.sqlite3",
    },
})
