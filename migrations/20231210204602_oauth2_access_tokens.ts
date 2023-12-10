import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        .createTableIfNotExists("oauth_access_tokens", (table) => {
            table
                .uuid("id", { primaryKey: true, useBinaryUuid: true })
                .defaultTo(knex.raw("uuid_generate_v4()"))

            table.string("accessToken")
            table.date("accessTokenExpiresAt")

            table.string("refreshToken")
            table.date("refreshTokenExpiresAt")

            table.uuid("userId")
            table.uuid("clientId")

            table.foreign("userId").references("users.id")
            table.foreign("clientId").references("oauth_clients.clientId")

            table.timestamps(true, true, true)
        })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("oauth_access_tokens")
}
