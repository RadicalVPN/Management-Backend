import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("users_webauth_credentials", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.uuid("userId")
            table.string("authenticatorName")
            table.string("credentialId")
            table.string("credentialPublicKey")
            table.string("credentialAlgorithm")
            table.timestamp("lastUsage")

            table.foreign("userId").references("users.id")

            table.timestamps(true, true, true)
        })
}

export function down(_knex: Knex) {
    console.log("dummy")
}
