import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("node_locations", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("country_code")
            table.string("country_name")
            table.string("city")
            table.string("latitude")
            table.string("longitude")

            table.timestamps(true, true, true)
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("node_locations")
}
