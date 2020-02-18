import { RequestHandler, Request } from 'express';

export function saveQueryAsCookie(cookieName: string): RequestHandler {
    return (req, res, next) => {
        res.cookie(cookieName, JSON.stringify(req.query), {
            path: req.originalUrl,
        });

        next();
    };
}

export function extractQueryFromCookie(cookieName: string): RequestHandler {
    return (req, res, next) => {
        if (req.cookies[cookieName]) {
            req.query = JSON.parse(req.cookies[cookieName]);
            res.clearCookie(cookieName);
        }

        next();
    };
}

export interface LocalSavedRequest extends Request {
    locals: any;
}

export function saveQueryAsLocals(): RequestHandler {
    return (req, res, next) => {
        const localReq = req as LocalSavedRequest;
        localReq.locals = req.query || {};

        next();
    };
}

export function extractQueryFromLocals(): RequestHandler {
    return (req, res, next) => {
        const localReq = req as LocalSavedRequest;
        if (localReq.locals) {
            req.query = { ...req.query, ...localReq.locals };
        }

        next();
    };
}
