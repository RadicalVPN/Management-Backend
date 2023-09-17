import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.string("public_key")
        table.string("private_key")
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.dropColumn("public_key")
        table.dropColumn("private_key")
    })
}
