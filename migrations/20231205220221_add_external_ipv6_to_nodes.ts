import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.boolean("external_ip6").defaultTo(false)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.boolean("external_ip6")
    })
}
