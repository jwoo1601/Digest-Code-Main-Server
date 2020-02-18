import { ERoutingMethod, IRouteEndpoint } from '../interfaces/router';
import { CLIENT_ERROR_NO_MATCHING_ROUTE } from '../internals/response';
import { BaseRouter } from '../internals/router';
import { APIRouter } from './api/api';
import { CDNRouter } from './cdn/cdn';

const get: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/',
    handler: async function(req, res, logger) {
        return {
            response: CLIENT_ERROR_NO_MATCHING_ROUTE,
        };
    },
};

export class RootRouter extends BaseRouter {
    constructor() {
        super('root', [get], [new APIRouter(), new CDNRouter()], true);
    }
}
