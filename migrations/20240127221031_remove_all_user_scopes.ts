import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.table("users_scopes").delete()
}

export function down(_knex: Knex) {
    console.log("dummy")
}
