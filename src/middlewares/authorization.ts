import { RequestHandler, Request } from 'express';
import passport from 'passport';

import { IPermission, Permissions } from '../interfaces/permission';
import { AuthenticatedRequest } from './authentication';
import { IClientModel } from '../models/client';
import { FirstPartyAuthorizationService } from '../internals/auth.firstParty';
import {
    CLIENT_ERROR_AUTHENTICATION_REQUIRED,
    CLIENT_ERROR_NO_PERMISSION,
} from '../internals/response';

export interface OAuth2AuthorizedRequest extends Request {
    'digestCode/oauth2': {
        client: IClientModel;
        permissions: IPermission[];
    };
}

export function authorizeOAuth2(): RequestHandler {
    return passport.authenticate('bearer', {
        session: false,
        assignProperty: 'digestCode/oauth2',
    });
}

export function requireOAuth2Authorization(): RequestHandler {
    return passport.authenticate('bearer', {
        session: false,
        failWithError: true,
        assignProperty: 'digestCode/oauth2',
    });
}

export interface FirstPartyAuthorizedRequest extends Request {
    'digestCode/firstParty': boolean;
}

export function authorizeFirstParty(): RequestHandler {
    return (req: FirstPartyAuthorizedRequest, res, next) => {
        const firstPartyHeader =
            req.headers['X-Digest-Code-First-Party-Access'];
        if (
            firstPartyHeader &&
            FirstPartyAuthorizationService.verifyToken(
                firstPartyHeader as string,
            )
        ) {
            req['digestCode/firstParty'] = true;
        }

        next();
    };
}

export function authorize(): RequestHandler {
    return (req, res, next) => {
        authorizeFirstParty()(req, res, () =>
            authorizeOAuth2()(req, res, next),
        );
    };
}

export function restrictPermission(required: IPermission): RequestHandler {
    return (req, res, next) => {
        if (req.isUnauthenticated()) {
            return next(CLIENT_ERROR_AUTHENTICATION_REQUIRED);
        }
        const authReq = req as AuthenticatedRequest;
        const userPermission =
            authReq['digestCode/auth'].membership[required.type][required.prop];
        if (Permissions.lt(userPermission, required.value)) {
            return next(CLIENT_ERROR_NO_PERMISSION);
        }

        const firstPartyReq = req as FirstPartyAuthorizedRequest;
        if (firstPartyReq['digestCode/firstParty']) {
            return next();
        }

        const oauth2Req = req as OAuth2AuthorizedRequest;
        const clientPermission = oauth2Req[
            'digestCode/oauth2'
        ].permissions.find(
            p => p.type == required.type && p.prop == required.prop,
        );
        if (
            clientPermission &&
            Permissions.ge(clientPermission.value, required.value)
        ) {
            return next();
        }

        return next(CLIENT_ERROR_NO_PERMISSION);
    };
}
