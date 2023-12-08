import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("users", (table) => {
        table.boolean("emailVerified").defaultTo(false)
    })
}

export function down(): void {
    console.log("dummy")
}
