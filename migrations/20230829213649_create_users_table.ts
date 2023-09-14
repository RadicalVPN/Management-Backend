import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists("users", (table) => {
        table.increments()

        table.string("username").unique()
        table.string("email").unique()
        table.string("passwordHash")
        table.string("passwordSalt")
        table.boolean("active").defaultTo(true)

        table.timestamps(true, true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("users")
}
