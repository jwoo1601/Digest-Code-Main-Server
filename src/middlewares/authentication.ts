import { RequestHandler, Request } from 'express';
import passport from 'passport';

import { IUserModel } from '../models/user';

export interface AuthenticatedRequest extends Request {
    'digestCode/auth': IUserModel;
}

export function authenticate(): RequestHandler {
    return passport.authenticate('digest-code', {
        session: false,
        // failWithError: true,
        assignProperty: 'digestCode/auth',
    });
}

export function ensureLoggedIn(action: RequestHandler): RequestHandler {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        action(req, res, (err?: any) => {
            if (err) {
                next(err);
            }
        });
    };
}

export function ensureLoggedOut(action: RequestHandler): RequestHandler {
    return (req, res, next) => {
        if (req.isUnauthenticated()) {
            return next();
        }

        action(req, res, (err?: any) => {
            if (err) {
                next(err);
            }
        });
    };
}

// export function ensureLoggedIn(options: IRedirectOptions): RequestHandler {
// return (req, res, next) => {
// if (req.isAuthenticated()) {
// next();
// } else {
// const { redirectOption, redirectURI } = options;
// if (redirectOption == ERedirectOption.USE_QUERY_STRING) {
// res.redirect(req.query.redirectURI);
// } else if (redirectOption == ERedirectOption.USE_REDIRECT_URI) {
// res.redirect(redirectURI);
// } else if (redirectOption == ERedirectOption.USE_CURRENT_URL) {
// const subdomain = req.subdomains.reverse().join('.');
// const currentURL = `${subdomain ? subdomain + '.' : ''}${
// req.hostname
// }${req.originalUrl}`;
// res.redirect(currentURL);
// } else {
// next(ErrorResponses.AUTHENTICATION_REQUIRED);
// }
// }
// };
// }
//
// export function ensureLoggedOut(options: IRedirectOptions): RequestHandler {
// return (req, res, next) => {
//     if (req.isUnauthenticated()) {
//         next();
//     } else {
//         const { redirectOption, redirectURI } = options;
//         if (redirectOption == ERedirectOption.USE_QUERY_STRING) {
//             res.redirect(req.query.redirectURI);
//         } else if (redirectOption == ERedirectOption.USE_REDIRECT_URI) {
//             res.redirect(redirectURI);
//         } else if (redirectOption == ERedirectOption.USE_CURRENT_URL) {
//             const subdomain = req.subdomains.reverse().join('.');
//             const currentURL = `${subdomain ? subdomain + '.' : ''}${
//                 req.hostname
//             }${req.originalUrl}`;
//             res.redirect(currentURL);
//         } else {
//             next(ErrorResponses.AUTHENTICATION_REQUIRED);
//         }
//     }
// };
// }
