import { ERoutingMethod, IRouteEndpoint } from '../../../interfaces/router';
import { BaseRouter } from '../../../internals/router';
import { LoginValidator } from '../../../validators/login';
import { User } from '../../../models/user';
import { AuthenticationService } from '../../../internals/authentication';
import { ensureLoggedOut } from '../../../middlewares/authentication';
import { endResponse } from '../../../middlewares/response';
import { openLoginDialog } from '../../../middlewares/dialog';
import { saveQueryAsLocals } from '../../../middlewares/query';
import {
    cacheRedirect,
    ERedirectOption,
    RedirectableResponse,
} from '../../../middlewares/redirect';
import {
    CLIENT_ERROR_USER_ALREADY_AUTHENTICATED,
    CLIENT_ERROR_INVALID_FIELD_INPUT,
    INFO_SUCCESSFUL_AUTHENTICATION,
    SERVER_ERROR_GENERAL_OPERATION_FAILURE,
    CLIENT_ERROR_INCORRECT_USER_DATA,
} from '../../../internals/response';
import { handleErrorByLogFetch } from '../../../middlewares/errorHandlers';

/**
 * GET /api/v1/login
 * @requestBody { username: string, password: string }
 * @response token
 */
const login: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/',
    middlewares: [
        cacheRedirect({ redirectOption: ERedirectOption.USE_REQUEST_BODY }),
    ],
    defaults: {
        username: null,
        password: null,
    },
    handler: async function(req, res, logger) {
        const validator = new LoginValidator();
        const { valid, validated, errors } = validator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(`Failed to authenticate User ${req.body.username}`);

            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { username, password } = validated;
        const foundUser = await User.findOne({
            username,
        });
        if (foundUser && foundUser.validatePassword(password)) {
            const token = AuthenticationService.encodeToken({
                username: foundUser.username,
            });
            if (token) {
                const redirectRes = res as RedirectableResponse;
                if (redirectRes.redirectable) {
                    redirectRes.header(
                        'X-Digest-Code-Authentication',
                        `v${AuthenticationService.version} ${token}`,
                    );
                    redirectRes.handleRedirect();
                }

                return {
                    response: INFO_SUCCESSFUL_AUTHENTICATION,
                    data: {
                        authentication_token: token,
                        authentication_token_version:
                            AuthenticationService.version,
                    },
                };
            }

            return {
                response: SERVER_ERROR_GENERAL_OPERATION_FAILURE,
            };
        }

        return {
            response: CLIENT_ERROR_INCORRECT_USER_DATA,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to authenticate User ${req.body.username}`,
    })),
};

/**
 * GET /api/v1/login/dialog
 */
const showLoginDialog: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/dialog',
    middlewares: [
        ensureLoggedOut(endResponse(CLIENT_ERROR_USER_ALREADY_AUTHENTICATED)),
        saveQueryAsLocals(),
        openLoginDialog(),
    ],
};

export class LoginRouter extends BaseRouter {
    constructor() {
        super('login', [login, showLoginDialog], []);
    }
}
