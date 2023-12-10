import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("oauth_clients", (table) => {
            table
                .uuid("clientId", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("clientName")
            table.string("redirectUri")
            table.string("grants")

            table.timestamps(true, true, true)
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("oauth_clients")
}
