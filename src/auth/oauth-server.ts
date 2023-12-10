import * as OAuth2Server from "@node-oauth/oauth2-server"
import OAuthServer, { Request, Response } from "@node-oauth/oauth2-server"
import express from "express"

interface IOAuthServerOptions extends OAuth2Server.ServerOptions {
    useErrorHandler?: boolean
    continueMiddleware?: boolean
}

export class OAuth {
    useErrorHandler: boolean
    continueMiddleware: boolean
    options: IOAuthServerOptions
    server: OAuthServer

    constructor(options: IOAuthServerOptions) {
        this.options = options

        this.useErrorHandler = this.options.useErrorHandler === true
        this.continueMiddleware = this.options.continueMiddleware === true

        //remove our custom options
        delete this.options.useErrorHandler
        delete this.options.continueMiddleware

        this.server = new OAuthServer(this.options)
    }

    authenticate(options: OAuth2Server.AuthenticateOptions) {
        return async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
        ) => {
            const request = new Request(req)
            const response = new Response(res)
            let token
            try {
                token = await this.server.authenticate(
                    request,
                    response,
                    options,
                )
            } catch (err) {
                this.handleError(res, null, err, next)
                return
            }
            res.locals.oauth = { token }
            return next()
        }
    }

    authorize(options?: OAuth2Server.AuthorizeOptions) {
        return async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
        ) => {
            const request = new Request(req)
            const response = new Response(res)
            let code
            try {
                code = await this.server.authorize(request, response, options)
            } catch (err) {
                this.handleError(res, response, err, next)
                return
            }
            res.locals.oauth = { code }
            if (this.continueMiddleware) {
                next()
            }
            return this.handleResponse(req, res, response)
        }
    }

    token(options?: OAuth2Server.TokenOptions) {
        return async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction,
        ) => {
            const request = new Request(req)
            const response = new Response(res)
            let token
            try {
                token = await this.server.token(request, response, options)
            } catch (err) {
                this.handleError(res, response, err, next)
                return
            }
            res.locals.oauth = { token }
            if (this.continueMiddleware) {
                next()
            }
            return this.handleResponse(req, res, response)
        }
    }

    private handleResponse(
        req: express.Request,
        res: express.Response,
        oauthResponse: any,
    ) {
        if (oauthResponse.status === 302) {
            const location = oauthResponse.headers.location
            delete oauthResponse.headers.location
            res.set(oauthResponse.headers)
            res.redirect(location)
            return
        }
        res.set(oauthResponse.headers)
        res.status(oauthResponse.status).send(oauthResponse.body)
    }

    private handleError(
        res: express.Response,
        oauthResponse: any,
        error: any,
        next: express.NextFunction,
    ) {
        if (this.useErrorHandler) {
            return next(error)
        }

        if (Object.keys(oauthResponse?.headers || {}).length > 0) {
            res.set(oauthResponse.headers)
        }

        //use 500 if status code is not valid
        if (!(error.code >= 100 && error.code <= 599)) {
            error.code = 500
        }

        res.status(error.code)

        if (error instanceof OAuth2Server.UnauthorizedRequestError) {
            return res.send()
        }

        return res.send({ error: error.name, error_description: error.message })
    }
}
