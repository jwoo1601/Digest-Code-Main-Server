import { RequestHandler } from 'express';
import { IRouteResponse } from '../interfaces/router';

export interface RedirectableResponse extends IRouteResponse {
    redirectable: boolean;
    handleRedirect(): void;
}

export const enum ERedirectOption {
    USE_QUERY_STRING,
    USE_REQUEST_BODY,
    USE_REDIRECT_URI,
    USE_CURRENT_URL,
    USE_COOKIE,
    USE_SESSION,
}

export interface IRedirectOptions {
    redirectOption: ERedirectOption;
    redirectURI?: string;
    clearURI?: boolean;
}

export function cacheRedirect(options: IRedirectOptions): RequestHandler {
    return (req, res, next) => {
        let cachedURI: string;

        const { redirectOption, redirectURI, clearURI } = options;
        if (redirectOption == ERedirectOption.USE_QUERY_STRING) {
            cachedURI = req.query.redirectUrl;
        } else if (redirectOption === ERedirectOption.USE_REQUEST_BODY) {
            cachedURI = req.body.redirectUrl;
        } else if (redirectOption == ERedirectOption.USE_REDIRECT_URI) {
            cachedURI = redirectURI;
        } else if (redirectOption == ERedirectOption.USE_CURRENT_URL) {
            const subdomain = req.subdomains.reverse().join('.');
            cachedURI = `${subdomain ? subdomain + '.' : ''}${req.hostname}${
                req.originalUrl
            }`;
        } else if (redirectOption == ERedirectOption.USE_COOKIE) {
            cachedURI = req.cookies.redirectURI;
            if (clearURI) {
                res.clearCookie('redirectURI');
            }
        } else if (redirectOption == ERedirectOption.USE_SESSION) {
            cachedURI = req.session.redirectURI;
            if (clearURI) {
                delete req.session.redirectURI;
            }
        }

        const redirectablRes = res as RedirectableResponse;
        if (cachedURI) {
            redirectablRes.redirectable = true;
            redirectablRes.handleRedirect = () => res.redirect(cachedURI);
        } else {
            redirectablRes.redirectable = false;
            redirectablRes.handleRedirect = () => {};
        }
    };
}
