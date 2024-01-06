import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("users_scopes", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("userId")
            table.string("scopeName")

            table.foreign("userId").references("users.id")
            table.foreign("scopeName").references("scopes.name")

            table.timestamps(true, true, true)
        })
}

export function down(_knex: Knex) {
    console.log("dummy")
}
