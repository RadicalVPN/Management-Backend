import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists("vpns", (table) => {
        table.increments()

        table.string("alias")
        table.string("ipv4")
        table.string("ipv6")
        table.string("pub")
        table.string("priv")
        table.string("psk")
        table.integer("userId").unsigned()
        table.boolean("active").defaultTo(true)

        table.foreign("userId").references("users.id")

        table.timestamps(true, true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("vpns")
}
