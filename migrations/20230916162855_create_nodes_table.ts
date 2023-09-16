import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists("nodes", (table) => {
        table.increments()

        table.string("hostname")
        table.string("country")
        table.string("city")

        table.timestamps(true, true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("nodes")
}
