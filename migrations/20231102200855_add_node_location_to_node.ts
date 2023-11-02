import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.uuid("node_location")
        table.foreign("node_location").references("node_locations.id")
    })
}

export async function down(knex: Knex): Promise<void> {}
