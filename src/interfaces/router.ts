import {
    Application,
    Request,
    Response,
    RequestHandler,
    NextFunction,
    Router,
} from 'express';
import { Logger } from 'winston';

import { ResponseEx } from '../internals/response';

export interface IRouter {
    getInstance(): Router;
    install(base: IRouter, app: Application): Promise<void>;
}

export const enum ERoutingMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
}

export interface IRouteRequest extends Request {}
export interface IRouteResponse extends Response {
    sendResponseEx(response: ResponseEx, data?: object): void;
}

export interface IRouteProcessResult {
    response: ResponseEx;
    data?: object;
}

export type IRouteEndpointHandler = (
    req: IRouteRequest,
    res: IRouteResponse,
    logger: Logger,
) => Promise<IRouteProcessResult>;

export type IRouteEndpointErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
    logger: Logger,
) => void;

export interface IRouteEndpoint {
    method: ERoutingMethod;
    route: string;
    defaults?: object;
    middlewares?: RequestHandler[];
    handler?: IRouteEndpointHandler;
    errorHandler?: IRouteEndpointErrorHandler;
}

export interface IRouteEndpointOptions {
    useExternalRoute?: boolean;
    externalRoute?: string;
    middlewares?: RequestHandler[];
}
