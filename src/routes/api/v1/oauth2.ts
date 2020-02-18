import { IRouteEndpoint, ERoutingMethod } from '../../../interfaces/router';
import { BaseRouter } from '../../../internals/router';
import {
    authorize,
    processDecision,
    issueToken,
    sendAuthErrorResponse,
    authenticateClient,
    setGrantType,
} from '../../../middlewares/oauth2';
import { authenticate } from '../../../middlewares/authentication';
import { openOAuth2Dialog } from '../../../middlewares/dialog';

/* 
    req.oauth2 = {
        client
        redirectURI
        webOrigin?
        req = { type = 'token', clientID, redirectURI, scope: scope, state: state }
        user = req.user
        locals = req.locals
    }
 */

/**
 * @query { response_type = 'token', client_id, redirect_uri, scope, state }
 * @requestBody { response_type = 'token' }
 */
const getAuthorize: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/authorize',
    middlewares: [authenticate(), authorize(), openOAuth2Dialog()],
};

const grantPermission: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/decision',
    middlewares: [authenticate(), processDecision()],
};

/**
 * @requestBody { scope, client_id, client_secret }
 * @response { access_token, token_type = 'Bearer', refreshToken, }
 */
const issueClientToken: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/token/client',
    middlewares: [
        authenticateClient(),
        authenticate(),
        setGrantType('clientCredentials'),
        issueToken(),
    ],
    errorHandler: sendAuthErrorResponse(),
};

/**
 * Issues an access token
 * @requestBody { scope }
 * @response { access_token, token_type = 'Bearer', state }
 */
const issueRefreshToken: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/token/refresh',
    middlewares: [
        authenticateClient(),
        authenticate(),
        setGrantType('refreshToken'),
        issueToken(),
    ],
    errorHandler: sendAuthErrorResponse(),
};

/**
 * /api/v1/oauth2
 */
export class OAuth2Router extends BaseRouter {
    constructor() {
        super(
            'oauth2',
            [
                getAuthorize,
                grantPermission,
                issueClientToken,
                issueRefreshToken,
            ],
            [],
        );
    }
}
