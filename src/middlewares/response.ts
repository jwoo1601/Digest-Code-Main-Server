import { RequestHandler } from 'express';

import { ResponseEx } from '../internals/response';

export function endResponse(response: ResponseEx, data?: any): RequestHandler {
    return (req, res) => {
        response.send(res, data);
    };
}
