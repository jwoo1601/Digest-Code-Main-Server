import { sign, verify, Algorithm, TokenExpiredError } from 'jsonwebtoken';
import { Logger } from 'winston';
import uuid from 'uuid';

import { authentication } from '../credentials';
import { Logging } from '../logging';

export interface IAuthenticationToken {
    username: string;
}

export class AuthenticationService {
    private static logger: Logger;

    static getLogger(): Logger {
        return this.logger;
    }

    static async init() {
        this.logger = await Logging.createLogger('authentication');
    }

    static get version(): string {
        return '1.0';
    }

    static encodeToken(token: IAuthenticationToken): string {
        try {
            const {
                secret,
                algorithm,
                issuer,
                subject,
                expiresIn,
            } = authentication.jwt;

            return sign(
                {
                    ...token,
                    state: uuid.v4(),
                },
                secret,
                {
                    algorithm: algorithm as Algorithm,
                    issuer,
                    subject,
                    expiresIn,
                },
            );
        } catch (err) {
            this.logger.error('Failed to encode token as JWT', {
                error: err,
            });
        }
    }

    static verifyToken(token: string): boolean {
        try {
            const { secret, algorithm, issuer, subject } = authentication.jwt;

            if (
                verify(token, secret, {
                    algorithms: [algorithm as Algorithm],
                    issuer,
                    subject,
                })
            ) {
                return true;
            }
        } catch (err) {
            return false;
        }
    }

    static decodeToken(
        token: string,
    ): { decoded?: IAuthenticationToken; expired?: boolean } {
        try {
            const { secret, algorithm, issuer, subject } = authentication.jwt;

            return {
                decoded: verify(token, secret, {
                    algorithms: [algorithm as Algorithm],
                    issuer,
                    subject,
                }) as IAuthenticationToken,
            };
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                return { expired: true };
            }
            this.logger.error('Failed to decode JWT', { error: err });
        }

        return {};
    }
}
