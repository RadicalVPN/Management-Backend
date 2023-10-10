import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("nodes", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("hostname")
            table.string("country")
            table.string("city")
            table.string("internal_ip")

            table.timestamps(true, true, true)
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("nodes")
}
