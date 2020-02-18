import passport from 'passport';

import DigestCodeStrategy from './digestCodeStrategy';
import { User } from '../models/user';
import { AuthenticationService } from '../internals/authentication';
import {
    CLIENT_ERROR_USER_NOT_FOUND,
    CLIENT_ERROR_AUTHENTICATION_TOKEN_EXPIRED,
    CLIENT_ERROR_INVALID_AUTHENTICATION_TOKEN,
    ClientErrorResponse,
    ServerErrorResponse,
} from '../internals/response';

export type DigestCodeVerifyDoneFunction = (
    err: Error | ClientErrorResponse | ServerErrorResponse,
    user?: any,
    info?: any,
) => void;

export default function Authentication() {
    passport.use(
        new DigestCodeStrategy(
            { version: AuthenticationService.version },
            async function(token: string, done: DigestCodeVerifyDoneFunction) {
                const { decoded, expired } = AuthenticationService.decodeToken(
                    token,
                );
                if (decoded) {
                    const foundUser = await User.findOne({
                        username: decoded.username,
                    });
                    if (foundUser) {
                        done(null, foundUser);
                    } else {
                        done(CLIENT_ERROR_USER_NOT_FOUND);
                    }
                } else if (expired) {
                    done(CLIENT_ERROR_AUTHENTICATION_TOKEN_EXPIRED);
                } else {
                    done(CLIENT_ERROR_INVALID_AUTHENTICATION_TOKEN);
                }
            },
        ),
    );
}
