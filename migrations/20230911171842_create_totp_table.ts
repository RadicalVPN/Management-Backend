import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists("users_totp", (table) => {
        table.increments()

        table.string("privateKey")
        table.boolean("confirmed")
        table.integer("userId").unsigned().unique()

        table.foreign("userId").references("users.id")

        table.timestamps(true, true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("users_totp")
}
