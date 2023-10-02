import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("users", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

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
