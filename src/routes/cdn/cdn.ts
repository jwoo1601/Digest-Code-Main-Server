import { BaseRouter } from '../../internals/router';
import { ResourceRouter } from './resource';
import { isProductionMode } from '../../systemQuery';

export class CDNRouter extends BaseRouter {
    constructor() {
        super('cdn', [], [new ResourceRouter()], false, isProductionMode());
    }
}
