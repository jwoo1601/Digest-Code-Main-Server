import {
    Router,
    Application,
    RequestHandler,
    ErrorRequestHandler,
} from 'express';
import NewPromiseRouter from 'express-promise-router';
import { Logger } from 'winston';

import {
    IRouter,
    IRouteEndpoint,
    IRouteEndpointOptions,
    IRouteRequest,
    IRouteResponse,
    ERoutingMethod,
} from '../interfaces/router';
import { Logging } from '../logging';

const subdomain = require('express-subdomain');

export class BaseRouter implements IRouter {
    private name: string;
    private instance: Router;
    private logger: Logger;
    private endpoints: IRouteEndpoint[];
    private children: IRouter[];
    private isRoot: boolean;
    private useSubdomain: boolean;

    constructor(
        name: string,
        endpoints: IRouteEndpoint[],
        children: IRouter[],
        isRoot: boolean = false,
        useSubdomain: boolean = false,
    ) {
        this.name = name;
        this.instance = NewPromiseRouter();
        this.endpoints = [...endpoints];
        this.children = [...children];
        this.isRoot = isRoot;
        this.useSubdomain = useSubdomain;
    }

    get Name(): string {
        return this.name;
    }

    get Instance(): Router {
        return this.instance;
    }

    get Logger(): Logger {
        return this.logger;
    }

    get Endpoints(): IRouteEndpoint[] {
        return this.endpoints;
    }

    get Children(): IRouter[] {
        return this.children;
    }

    get IsRoot(): boolean {
        return this.isRoot;
    }

    get UseSubdomain(): boolean {
        return this.useSubdomain;
    }

    getInstance(): Router {
        return this.instance;
    }

    async install(base: IRouter, app: Application) {
        this.logger = await Logging.createLogger(`route:${this.name}`);

        for (const endpoint of this.endpoints) {
            RouterImpl.on(this.instance, endpoint, this.logger);
        }

        for (const child of this.children) {
            child.install(this, app);
        }

        if (this.isRoot) {
            if (this.useSubdomain) {
                app.use(subdomain(this.name, this.instance));
            } else {
                app.use(this.instance);
            }
        } else {
            if (this.useSubdomain) {
                base.getInstance().use(subdomain(this.name, this.instance));
            } else {
                base.getInstance().use(`/${this.name}`, this.instance);
            }
        }
    }
}

export class RouterImpl {
    static on(
        router: Router,
        endpoint: IRouteEndpoint,
        logger: Logger,
        options?: IRouteEndpointOptions,
    ) {
        const route =
            options && options.useExternalRoute
                ? options.externalRoute
                : endpoint.route;
        const actions = [];

        if (options && options.middlewares) {
            actions.push(...options.middlewares);
        }

        if (endpoint.middlewares && endpoint.middlewares.length > 0) {
            actions.push(...endpoint.middlewares);
        }

        const routeHandler: RequestHandler = async (req, res, next) => {
            if (endpoint.handler) {
                const routeReq = <IRouteRequest>{ ...req };
                const routeRes = <IRouteResponse>{
                    ...res,
                    sendResponseEx(response, data?) {
                        this.sendResponseEx(res, response, data);
                    },
                };
                const result = await endpoint.handler(
                    routeReq,
                    routeRes,
                    logger,
                );
                if (result) {
                    result.response.send(res, result.data);
                }
            }

            next();
        };
        actions.push(routeHandler);

        const routeErrorHandler: ErrorRequestHandler = (
            err,
            req,
            res,
            next,
        ) => {
            if (endpoint.errorHandler) {
                endpoint.errorHandler(err, req, res, next, logger);
            }
        };
        actions.push(routeErrorHandler);

        switch (endpoint.method) {
            case ERoutingMethod.GET: {
                router.get(route, ...actions);
                break;
            }
            case ERoutingMethod.POST: {
                router.post(route, ...actions);
                break;
            }
            case ERoutingMethod.PUT: {
                router.put(route, ...actions);
                break;
            }
            case ERoutingMethod.DELETE: {
                router.delete(route, ...actions);
                break;
            }
            case ERoutingMethod.HEAD: {
                router.head(route, ...actions);
                break;
            }
        }
    }
}
