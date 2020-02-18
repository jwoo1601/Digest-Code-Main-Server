import { Logger } from 'winston';
import { sign, verify, Algorithm, TokenExpiredError } from 'jsonwebtoken';
import uuid from 'uuid';

import { Logging } from '../logging';
import { authorization } from '../credentials';

export interface IFirstPartyAccessToken {
    issuedAt: Date;
}

export class FirstPartyAuthorizationService {
    private static logger: Logger;

    static getLogger(): Logger {
        return this.logger;
    }

    static async init() {
        this.logger = await Logging.createLogger('authorization/firstParty');
    }

    static encodeToken(token: IFirstPartyAccessToken): string {
        try {
            const {
                secret,
                algorithm,
                issuer,
                subject,
                expiresIn,
            } = authorization.firstParty.accessToken;

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
            const {
                secret,
                algorithm,
                issuer,
                subject,
            } = authorization.firstParty.accessToken;

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
    ): { decoded?: IFirstPartyAccessToken; expired?: boolean } {
        try {
            const {
                secret,
                algorithm,
                issuer,
                subject,
            } = authorization.firstParty.accessToken;

            return {
                decoded: verify(token, secret, {
                    algorithms: [algorithm as Algorithm],
                    issuer,
                    subject,
                }) as IFirstPartyAccessToken,
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
