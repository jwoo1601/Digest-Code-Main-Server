import { Router, Application, Request, Response, NextFunction } from 'express';

import { IRouter } from '../interfaces/router';
import { RootRouter } from './root';
import { ResponseEx } from '../internals/response';
import { Logging } from '../logging';

/*
    req.user = {
        user // available if middleware authenticate was used
            OR
        client, permissions // available if middleware authorizeOAuth2 was used
    }

    req.oauth2 // only available on oauth2 routes (/api/v1/oauth2)

    req = {
        digestCode/auth: { user: IUserModel }, // available if middleware authenticate was used
        digestCode/oauth2: { client: IClientModel, permissions }, // available if middleware authorizeOAuth2 was used
        digestCode/firstParty: boolean // available if middleware authorizeFirstParty was used
    }

    req.vars = {
        redirectURI // available if middleware redirect was used
    }

    req.actions = {
        handleRedirect // available if middleware redirect was used
    }

    ***** Deprecated *****
    req.logIn
    req.logOut
    **********************
*/

export class RouteManager {
    private static rootRouter: IRouter;

    static async installRoutes(app: Application) {
        this.rootRouter = new RootRouter();
        this.rootRouter.install(null, app);

        const logger = await Logging.createLogger('route');
        app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof ResponseEx) {
                const errorResponse = err as ResponseEx;
                errorResponse.send(res);

                logger.error(
                    `Unhandled error response: -code=${errorResponse.Code} -status=${errorResponse.Status} -message=${errorResponse.Message}`,
                    err,
                );
            } else {
                logger.error(`Unhandled error: ${JSON.stringify(err)}`, {
                    error: err,
                });
            }
        });
    }
}
