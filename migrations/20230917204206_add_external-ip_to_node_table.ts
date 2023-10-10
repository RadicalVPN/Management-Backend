import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.string("external_ip")
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.dropColumn("external_ip")
    })
}
