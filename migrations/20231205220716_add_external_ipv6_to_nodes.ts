import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table("nodes", (table) => {
        table.string("external_ip6")
    })
}

export function down(): void {
    console.log("dummy")
}
