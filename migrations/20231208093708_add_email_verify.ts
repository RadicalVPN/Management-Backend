import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("users_verify", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("verifyToken")

            table.uuid("userId")
            table.foreign("userId").references("users.id")

            table.timestamps(true, true, true)
        })
}

export function down(): void {
    console.log("dummy")
}
