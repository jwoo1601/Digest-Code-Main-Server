import { IRouteEndpointErrorHandler } from '../interfaces/router';
import { ResponseEx } from '../internals/response';
import { Request, Response } from 'express';

export function handleErrorByResponse(
    response: ResponseEx,
    data?: any,
): IRouteEndpointErrorHandler {
    return (err, req, res, next) => {
        response.send(res, data);
    };
}

export function handleErrorByLog(
    message: string,
    ...meta: any[]
): IRouteEndpointErrorHandler {
    return (err, req, res, next, logger) => {
        logger.error(
            message,
            {
                error: err,
            },
            ...meta,
        );
    };
}

export function handleErrorByLogFetch(
    fetcher: (
        req: Request,
        res: Response,
    ) => {
        message: string;
        meta?: object;
    },
): IRouteEndpointErrorHandler {
    return (err, req, res, next, logger) => {
        const { message, meta } = fetcher(req, res);

        logger.error(message, {
            error: err,
            ...meta,
        });
    };
}
