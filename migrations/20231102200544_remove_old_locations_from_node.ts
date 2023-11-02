import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.dropColumn("country")
        table.dropColumn("city")
    })
}

export async function down(knex: Knex): Promise<void> {}
