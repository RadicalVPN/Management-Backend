import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    const users = await knex("users").select("id")

    for (const user of users) {
        await knex("users_scopes").insert([
            {
                userId: user.id,
                scopeName: "user",
            },
            {
                userId: user.id,
                scopeName: "vpn:create",
            },
        ])
    }
}

export function down(_knex: Knex) {
    console.log("dummy")
}
