import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.dropTable("users_scopes")
    await knex.schema.dropTable("scopes")

    await knex.schema.createTableIfNotExists("scopes", (table) => {
        table.increments("id").primary()
        table.string("name")

        table.timestamps(true, true, true)
    })

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

    await knex.schema.createTableIfNotExists("users_scopes", (table) => {
        table.increments("id").primary()

        table.uuid("userId")
        table.integer("scopeId")

        table.foreign("userId").references("users.id")
        table.foreign("scopeId").references("scopes.id")

        table.timestamps(true, true, true)
    })
}

export function down(_knex: Knex) {
    console.log("dummy")
}
