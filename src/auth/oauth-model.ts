import * as OAuth2Server from "@node-oauth/oauth2-server"
import { validate as uuidValidate } from "uuid"
import { db } from "../database"

/* eslint-disable */

export class OAuthModel implements OAuth2Server.AuthorizationCodeModel {
    generateRefreshToken?(
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
        scope: string[],
    ): Promise<string> {
        throw new Error("Method not implemented.")
    }
    generateAuthorizationCode?(
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
        scope: string[],
    ): Promise<string> {
        throw new Error("Method not implemented.")
    }
    getAuthorizationCode(
        authorizationCode: string,
    ): Promise<OAuth2Server.AuthorizationCode | OAuth2Server.Falsey> {
        throw new Error("Method not implemented.")
    }
    saveAuthorizationCode(
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
        throw new Error("Method not implemented.")
    }
    revokeAuthorizationCode(
        code: OAuth2Server.AuthorizationCode,
    ): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    validateScope?(
        user: OAuth2Server.User,
        client: OAuth2Server.Client,
        scope: string[],
    ): Promise<string[] | OAuth2Server.Falsey> {
        throw new Error("Method not implemented.")
    }
    validateRedirectUri?(
        redirect_uri: string,
        client: OAuth2Server.Client,
    ): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    generateAccessToken?(
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
        scope: string[],
    ): Promise<string> {
        throw new Error("Method not implemented.")
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
            .modify(async (queryBuilder) => {
                if (clientSecret) {
                    await queryBuilder.where("clientSecret", clientSecret)
                }
            })
            .first()

        return {
            id: client.clientId,
            clientId: client.clientId,
            ...(client.clientSecret && { clientSecret: client.clientSecret }),
            grants: client.grants.split(","),
            redirectUris: client.redirectUri.split(","),
        }
    }
    saveToken(
        token: OAuth2Server.Token,
        client: OAuth2Server.Client,
        user: OAuth2Server.User,
    ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
        throw new Error("Method not implemented.")
    }
    getAccessToken(
        accessToken: string,
    ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
        throw new Error("Method not implemented.")
    }
}
