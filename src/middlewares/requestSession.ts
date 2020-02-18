import { RequestHandler } from 'express';
import { RequestSession } from '../models/requestSession';
import { REQUEST_SESSION_HTTP_HEADER_NAME } from '../interfaces/requestSession';
import {
    CLIENT_ERROR_REQUEST_SESSION_EXPIRED,
    CLIENT_ERROR_INVALID_REQUEST_SESSION_KEY,
    SERVER_ERROR_DATABASE_OPERATION_FAILURE,
} from '../internals/response';

export function validateRequestSessionKey(): RequestHandler {
    return async (req, res, next) => {
        const now = Date.now();

        try {
            const foundSession = await RequestSession.findOne({
                key: req.headers[REQUEST_SESSION_HTTP_HEADER_NAME],
            });
            if (foundSession) {
                if (now < foundSession.exp.getTime()) {
                    next();
                } else {
                    next(CLIENT_ERROR_REQUEST_SESSION_EXPIRED);
                }
            } else {
                next(CLIENT_ERROR_INVALID_REQUEST_SESSION_KEY);
            }
        } catch (err) {
            next(SERVER_ERROR_DATABASE_OPERATION_FAILURE);
        }
    };
}
