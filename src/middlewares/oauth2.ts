import { Request, RequestHandler, ErrorRequestHandler } from 'express';
import { OAuth2Service } from '../internals/auth.oauth2';
import { IClientModel } from '../models/client';
import passport from 'passport';
import { IUserModel } from '../models/user';

export interface OAuth2AuthorizedRequest extends Request {
    oauth2: {
        transactionID: string;
        client: IClientModel;
        redirectURI: string;
        req: {
            type: 'token';
            clientID: string;
            redirectURI: string;
            scope: string[];
            state: string;
        };
        locals: {
            client: IClientModel;
            user: IUserModel;
            scope: string[];
        };
    };
}

export function authorize(): RequestHandler {
    return OAuth2Service.middlewares.authorize;
}

export function processDecision(): RequestHandler {
    return OAuth2Service.middlewares.decision;
}

export function issueToken(): RequestHandler {
    return OAuth2Service.middlewares.token;
}

export function sendAuthErrorResponse(): ErrorRequestHandler {
    return OAuth2Service.middlewares.directErrorHandler;
}

export function forwardAuthError(): ErrorRequestHandler {
    return OAuth2Service.middlewares.indirectErrorHandler;
}

export function authenticateClient(): RequestHandler {
    return passport.authenticate('oauth2-client-password', { session: false });
}

export function setGrantType(grantType: string): RequestHandler {
    return (req, res, next) => {
        req.body.grant_type = grantType;
        next();
    };
}
