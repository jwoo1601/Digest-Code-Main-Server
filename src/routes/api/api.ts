import { ERoutingMethod, IRouteEndpoint } from '../../interfaces/router';
import { BaseRouter } from '../../internals/router';
import { V1Router } from './v1/v1';
import { INFO_REFERENCE_API_DOCUMENTATION } from '../../internals/response';
import { isProductionMode } from '../../systemQuery';

const get: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/api',
    handler: async function(req, res, logger) {
        return {
            response: INFO_REFERENCE_API_DOCUMENTATION,
            data: {
                documentation_url: 'https://digestcode.net/api',
            },
        };
    },
};

export class APIRouter extends BaseRouter {
    constructor() {
        super('api', [get], [new V1Router()], false, isProductionMode());
    }
}
