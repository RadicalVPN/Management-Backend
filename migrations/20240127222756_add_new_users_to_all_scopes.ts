import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    const users = await knex("users").select("id")
    const scopeUserId = (
        await knex("scopes").select("id").where("name", "user").first()
    ).id

    const scopeVpnCreateId = (
        await knex("scopes").select("id").where("name", "vpn:create").first()
    ).id

    for (const user of users) {
        await knex("users_scopes").insert([
            {
                userId: user.id,
                scopeId: scopeUserId,
            },
            {
                userId: user.id,
                scopeId: scopeVpnCreateId,
            },
        ])
    }
}

export function down(_knex: Knex) {
    console.log("dummy")
}
