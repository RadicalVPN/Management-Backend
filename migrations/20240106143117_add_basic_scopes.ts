import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex("scopes").insert([
        {
            name: "user",
        },
        {
            name: "admin",
        },
        {
            name: "vpn:create",
        },
    ])
}

export function down(_: Knex) {
    console.log("dummy")
}
