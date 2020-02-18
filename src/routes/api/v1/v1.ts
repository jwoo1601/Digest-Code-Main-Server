import { ERoutingMethod, IRouteEndpoint } from '../../../interfaces/router';
import { OAuth2Router } from './oauth2';
import { PostRouter } from './post';
import { CourseRouter } from './course';
import { LoginRouter } from './login';
import { ClientRouter } from './client';
import { UserRouter } from './user';
import { BaseRouter } from '../../../internals/router';
import { INFO_REFERENCE_V1_DOCUMENTATION } from '../../../internals/response';

const get: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/',
    handler: async function(req, res, logger) {
        return {
            response: INFO_REFERENCE_V1_DOCUMENTATION,
            data: {
                documentation_url: 'https://digestcode.net/api/v1',
            },
        };
    },
};

export class V1Router extends BaseRouter {
    constructor() {
        super(
            'v1',
            [get],
            [
                new OAuth2Router(),
                new PostRouter(),
                new CourseRouter(),
                new LoginRouter(),
                new ClientRouter(),
                new UserRouter(),
            ],
        );
    }
}
