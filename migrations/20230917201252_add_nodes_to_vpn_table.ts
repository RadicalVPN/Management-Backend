import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("vpns", (table) => {
        table.integer("nodeId").unsigned()
        table.foreign("nodeId").references("nodes.id")
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table("vpns", (table) => {
        table.dropColumn("nodeId")
    })
}
