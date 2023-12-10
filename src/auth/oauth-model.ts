import * as OAuth2Server from "@node-oauth/oauth2-server"
import { validate as uuidValidate } from "uuid"
import { db } from "../database"

/* eslint-disable */

export class OAuthModel implements OAuth2Server.AuthorizationCodeModel {
    async getAuthorizationCode(
        authorizationCode: string,
    ): Promise<OAuth2Server.AuthorizationCode | OAuth2Server.Falsey> {
        const authorizationCodeData = await db
            .table("oauth_authorization_codes")
            .join(
                "oauth_clients",
                "oauth_clients.clientId",
                "oauth_authorization_codes.clientId",
            )
            .join("users", "users.id", "oauth_authorization_codes.userId")
            .select("*")
            .where("authorizationCode", authorizationCode)
            .first()

        if (!authorizationCodeData) {
            return
        }

        return {
            authorizationCode: authorizationCodeData.authorizationCode,
            expiresAt: authorizationCodeData.expiresAt,
            scope: authorizationCodeData.scope?.split(","),
            redirectUri: authorizationCodeData.redirectUri,
            client: {
                id: authorizationCodeData.clientId,
                clientId: authorizationCodeData.clientId,
                grants: authorizationCodeData.grants?.split(","),
                redirectUris: authorizationCodeData.redirectUri?.split(","),
            },
            user: {
                id: authorizationCodeData.userId,
                username: authorizationCodeData.username,
            },
        }
    }
    async saveAuthorizationCode(
        code: Pick<
            OAuth2Server.AuthorizationCode,
            | "redirectUri"
            | "authorizationCode"
            | "expiresAt"
            | "scope"
            | "codeChallenge"
            | "codeChallengeMethod"
        >,
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
    ): Promise<OAuth2Server.AuthorizationCode | OAuth2Server.Falsey> {
        const data = {
            authorizationCode: code.authorizationCode,
            expiresAt: code.expiresAt,
            redirectUri: code.redirectUri,
            ...(code.scope && { scope: code.scope.join(",") }),
            userId: user.id,
            clientId: client.id,
        }

        await db.table("oauth_authorization_codes").insert(data)

        return {
            ...data,
            scope: code?.scope,
            client: client,
            user: user,
        }
    }
    async getClient(
        clientId: string,
        clientSecret: string,
    ): Promise<OAuth2Server.Client | OAuth2Server.Falsey> {
        if (!uuidValidate(clientId)) {
            return
        }

        const client = await db
            .table("oauth_clients")
            .select("*")
            .where("clientId", clientId)
            // .modify(async (queryBuilder) => {
            //     if (clientSecret) {
            //         await queryBuilder.where("clientSecret", clientSecret)
            //     }
            // })
            .first()

        return {
            id: client.clientId,
            clientId: client.clientId,
            ...(client.clientSecret && { clientSecret: client.clientSecret }),
            grants: client.grants.split(","),
            redirectUris: client.redirectUri.split(","),
        }
    }
    async revokeAuthorizationCode(
        code: OAuth2Server.AuthorizationCode,
    ): Promise<boolean> {
        const result = await db
            .table("oauth_authorization_codes")
            .where("authorizationCode", code.authorizationCode)
            .where("clientId", code.client.id)
            .where("userId", code.user.id)
            .delete()

        return result > 0
    }
    async saveToken(
        token: OAuth2Server.Token,
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
    ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
        const data = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            userId: user.id,
            clientId: client.id,
        }

        await db.table("oauth_access_tokens").insert(data)

        return {
            ...data,
            client: client,
            user: user,
        }
    }
    getAccessToken(
        accessToken: string,
    ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
        console.log("get access token")
        throw new Error("Method not implemented.")
    }
}
