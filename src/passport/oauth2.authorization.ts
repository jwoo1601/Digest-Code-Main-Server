import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';

import { OAuth2Service, IAccessToken } from '../internals/auth.oauth2';
import { authorization } from '../credentials';
import { Client } from '../models/client';
import {
    CLIENT_ERROR_CLIENT_NOT_FOUND,
    CLIENT_ERROR_ACCESS_TOKEN_EXPIRED,
    CLIENT_ERROR_INVALID_ACCESS_TOKEN,
} from '../internals/response';

export default function OAuth2Authorization() {
    passport.use(
        new BearerStrategy({}, async (token, done) => {
            const { decoded, expired } = OAuth2Service.decodeToken<
                IAccessToken
            >(token, authorization.oauth2.accessToken);
            if (decoded) {
                const foundClient = await Client.findOne({
                    username: decoded.client.id,
                });
                if (foundClient) {
                    done(null, {
                        client: foundClient,
                        permissions: decoded.client.permissions,
                    });
                } else {
                    done(CLIENT_ERROR_CLIENT_NOT_FOUND);
                }
            } else if (expired) {
                done(CLIENT_ERROR_ACCESS_TOKEN_EXPIRED);
            } else {
                done(CLIENT_ERROR_INVALID_ACCESS_TOKEN);
            }
        }),
    );
}
