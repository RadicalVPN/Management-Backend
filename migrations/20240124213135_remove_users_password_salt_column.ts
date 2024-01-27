import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumn("passwordSalt")
    })
}

export function down(_knex: Knex) {
    console.log("dummy")
}
