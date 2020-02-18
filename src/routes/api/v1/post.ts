import { ERoutingMethod, IRouteEndpoint } from '../../../interfaces/router';
import { BaseRouter } from '../../../internals/router';
import { INFO_SUCCESSFUL_POSTING } from '../../../internals/response';
import { authenticate } from '../../../middlewares/authentication';
import {
    authorize,
    restrictPermission,
} from '../../../middlewares/authorization';
import {
    EPermissionTypes,
    EPermissionPropTypes,
    EPermission,
} from '../../../interfaces/permission';

/**
 * GET /api/v1/post
 * @query author: string
 * @query detailed: boolean
 */
const getPosts: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.POST,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
};

/**
 * GET /api/v1/post/:postId
 */
const getPostById: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/:postId',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.POST,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
};

/**
 * POST /api/v1/post
 */
const post: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.POST,
            prop: EPermissionPropTypes.CREATE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        return {
            response: INFO_SUCCESSFUL_POSTING,
        };
    },
};

/**
 * PUT /api/v1/post
 */
const put: IRouteEndpoint = {
    method: ERoutingMethod.PUT,
    route: '/',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.POST,
            prop: EPermissionPropTypes.MODIFY,
            value: EPermission.FULL_ACCESS,
        }),
    ],
};

/**
 * DELETE /api/v1/post/:postId
 */
const deletePostById: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/:postId',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.POST,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
};

// /api/v1/post
export class PostRouter extends BaseRouter {
    constructor() {
        super('post', [getPosts, getPostById, post, put, deletePostById], []);
    }
}
