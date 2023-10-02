import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("vpns", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("alias")
            table.string("ipv4")
            table.string("ipv6")
            table.string("pub")
            table.string("priv")
            table.string("psk")
            table.uuid("userId")
            table.boolean("active").defaultTo(true)

            table.foreign("userId").references("users.id")

            table.timestamps(true, true, true)
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("vpns")
}
