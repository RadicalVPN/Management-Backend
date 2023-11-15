import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.dropColumn("country")
        table.dropColumn("city")
    })
}

export function down(): void {
    console.log("dummy")
}
