import {
    createServer,
    OAuth2Server,
    grant,
    exchange,
    ExchangeDoneFunction,
    SerializeClientDoneFunction,
    DeserializeClientDoneFunction,
    AuthorizeOptions,
} from 'oauth2orize';
import { sign, verify, Algorithm, TokenExpiredError } from 'jsonwebtoken';
import uuid from 'uuid';

import {
    IPermissionProp,
    EPermissionTypes,
    EPermissionPropTypes,
    EPermission,
    IPermission,
} from '../interfaces/permission';
import { IMembership } from '../interfaces/membership';
import { authorization } from '../credentials';
import { Logger } from 'winston';
import { Logging } from '../logging';
import { Client, IClientModel } from '../models/client';
import { IUserModel } from '../models/user';

export interface IClientToken {
    clientId: string;
    username: string;
    scope: string[];
}

export interface IAccessToken {
    client: {
        id: string;
        name: string;
        secret: string;
        permissions: IPermission[];
    };
}

export interface IRefreshToken extends IAccessToken {
    refreshSeed: string;
}

class ServiceImpl {
    // validates if the req.query.client_id is registered in database
    static async validateClient(
        clientId: string,
        redirectURI: string,
        done: (err: Error, client?: IClientModel, redirectURI?: string) => void,
    ) {
        try {
            const foundClient = await Client.findById(clientId);
            if (foundClient) {
                done(null, foundClient, redirectURI);
            } else {
                // emits AuthorizationError('Unauthorized client', 'unauthorized_client'))
                done(null);
            }
        } catch (err) {
            done(err);
        }
    }

    static handleAuthRequest(
        client: IClientModel,
        user: IUserModel,
        scope: string[],
        type: string,
        areq: any,
        done: (err: Error, allow: boolean, info: any, locals: any) => void,
    ) {
        // forwards necessary info to the prompting middleware
        // we can grant the request right away by passing true to the second parameter
        done(
            null,
            false,
            {},
            { client, user, scope, redirectURI: areq.redirectURI },
        );
    }

    static issueClientToken(
        client: IClientModel,
        user: IUserModel,
        ares: any,
        done: (err: Error, token?: string, params?: any) => void,
    ) {
        const token = OAuth2Service.encodeToken(
            { clientId: client.id, username: user.username, scope: ares.scope },
            authorization.oauth2.clientToken,
        );
        if (token) {
            done(null, token);
        } else {
            done(
                new Error(
                    `Failed to issue Client Token for client {${client.id}}`,
                ),
            );
        }
    }

    static issueAccessToken(
        client: IClientModel,
        scope: string[],
        body: any,
        authInfo: { clientId: string; clientSecret: string },
        done: ExchangeDoneFunction,
    ) {
        const permissions = OAuth2Service.convertScopeToPermissions(scope);
        const token = OAuth2Service.encodeToken(
            {
                client: {
                    id: client.id,
                    name: client.name,
                    secret: client.secret,
                    permissions,
                },
            },
            authorization.oauth2.accessToken,
        );
        if (token) {
            const refreshToken = OAuth2Service.encodeToken(
                {
                    client: {
                        id: client.id,
                        name: client.name,
                        secret: client.secret,
                        permissions,
                    },
                    refreshSeed: uuid.v4(),
                },
                authorization.oauth2.refreshToken,
            );
            if (refreshToken) {
                done(null, token, refreshToken);
            } else {
                done(
                    new Error(
                        `Failed to issue Refresh Token for client {${client.id}}`,
                    ),
                );
            }
        } else {
            done(
                new Error(
                    `Failed to issue Access Token for client {${client.id}}`,
                ),
            );
        }
    }

    static issueAccessTokenFromRefreshToken(
        client: IClientModel,
        refreshToken: string,
        done: ExchangeDoneFunction,
    ) {
        const { decoded, expired } = OAuth2Service.decodeToken<IRefreshToken>(
            refreshToken,
            authorization.oauth2.refreshToken,
        );
        if (decoded && decoded.refreshSeed) {
            const token = OAuth2Service.encodeToken(
                { client: decoded.client },
                authorization.oauth2.accessToken,
            );
            if (token) {
                const newRefreshToken = OAuth2Service.encodeToken(
                    {
                        client: decoded.client,
                        refreshSeed: uuid.v4(),
                    },
                    authorization.oauth2.refreshToken,
                );
                if (newRefreshToken) {
                    done(null, token, newRefreshToken);
                } else {
                    done(null, token);
                }
            } else {
                done(
                    new Error(
                        `Failed to issue Access Token for client {${client.id}}`,
                    ),
                );
            }
        } else if (expired) {
            done(new Error(`Refresh Token has expired`));
        } else {
            done(
                new Error(
                    `Failed to issue Access Token for client {${client.id}} from Refresh Token`,
                ),
            );
        }
    }

    static serializeClientData(
        client: IClientModel,
        done: SerializeClientDoneFunction,
    ) {
        done(null, client.id);
    }

    static async deserailzeClientData(
        id: string,
        done: DeserializeClientDoneFunction,
    ) {
        try {
            const foundClient = await Client.findById(id);
            if (foundClient) {
                done(null, foundClient);
            } else {
                done(new Error('Client id was not found'));
            }
        } catch (err) {
            done(err);
        }
    }
}

// Lcreate:course/note
export class OAuth2Service {
    private static logger: Logger;
    private static server: OAuth2Server;

    static getLogger(): Logger {
        return this.logger;
    }

    static getServer(): OAuth2Server {
        return this.server;
    }

    static get middlewares() {
        return {
            authorize: this.server.authorization(
                {
                    sessionKey: 'authorization',
                    userProperty: 'digestCode/auth',
                } as AuthorizeOptions,
                ServiceImpl.validateClient,
                ServiceImpl.handleAuthRequest,
            ),
            decision: this.server.decision(
                {
                    cancelField: 'deny',
                    userProperty: 'digestCode/auth',
                    sessionKey: 'authorization',
                },
                (req: any, done) => {
                    return done(null, {});
                },
            ),
            token: this.server.token(),
            directErrorHandler: this.server.errorHandler({ mode: 'direct' }),
            indirectErrorHandler: this.server.errorHandler({
                mode: 'indirect',
            }),
        };
    }

    static get permissionMappings() {
        return {
            [EPermission.FULL_ACCESS]: 'F',
            [EPermission.LIMITED_ACCESS]: 'L',
            [EPermission.NO_ACCESS]: 'N',
            F: EPermission.FULL_ACCESS,
            L: EPermission.LIMITED_ACCESS,
            N: EPermission.NO_ACCESS,
        };
    }

    static async init() {
        this.logger = await Logging.createLogger('authorization/oauth2');

        this.server = createServer();
        this.server.grant(
            grant.token({ scopeSeparator: ',' }, ServiceImpl.issueClientToken),
        );
        this.server.exchange(
            exchange.clientCredentials(
                { scopeSeparator: ',' },
                ServiceImpl.issueAccessToken,
            ),
        );
        this.server.exchange(
            exchange.refreshToken(
                { scopeSeparator: ',' },
                ServiceImpl.issueAccessTokenFromRefreshToken,
            ),
        );
        this.server.serializeClient(ServiceImpl.serializeClientData);
        this.server.deserializeClient(ServiceImpl.deserailzeClientData);
    }

    static getScopeFromPermission(permission: IPermission): string {
        return `${this.permissionMappings[permission.value]}${
            permission.prop
        }:${permission.type}`;
    }

    static getPermissionFromScope(scope: string): IPermission {
        const value = this.permissionMappings[
            scope.substr(0, 1) as 'F' | 'L' | 'N'
        ];
        if (value) {
            const rest = scope.substr(1).split(':');
            if (rest.length === 2) {
                const prop = Object.values(EPermissionPropTypes).find(
                    p => p === rest[0],
                );
                if (prop) {
                    const type = Object.values(EPermissionTypes).find(
                        t => t === rest[1],
                    );
                    return {
                        type,
                        prop,
                        value,
                    };
                }
            }
        }

        return null;
    }

    static convertMembershipToScope(membership: IMembership): string[] {
        const scope: string[] = [];

        Object.entries(membership).forEach(([k, v]) => {
            const type = k as EPermissionTypes;
            const props = v as IPermissionProp;

            scope.push(
                ...Object.entries(props)
                    .filter(([k2, v2]) => v2 != EPermission.NO_ACCESS)
                    .map(([k2, v2]) => {
                        const prop = k2 as EPermissionPropTypes;
                        const value = v2 as EPermission;

                        return this.getScopeFromPermission({
                            type,
                            prop,
                            value,
                        });
                    }),
            );
        });

        return scope;
    }

    static convertScopeToPermissions(scope: string[]): IPermission[] {
        return scope
            .map(s => this.getPermissionFromScope(s))
            .filter(s => s !== null);
    }

    static encodeToken(
        token: IClientToken | IAccessToken | IRefreshToken,
        credentials: any,
    ): string {
        try {
            const {
                secret,
                algorithm,
                issuer,
                subject,
                expiresIn,
            } = credentials;

            return sign(
                {
                    ...token,
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

    static verifyToken(token: string, credentials: any): boolean {
        try {
            const { secret, algorithm, issuer, subject } = credentials;

            if (
                verify(token, secret, {
                    algorithms: [algorithm],
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

    static decodeToken<T extends IClientToken | IAccessToken | IRefreshToken>(
        token: string,
        credentials: any,
    ): { decoded?: T; expired?: boolean } {
        try {
            const { secret, algorithm, issuer, subject } = credentials;

            return {
                decoded: verify(token, secret, {
                    algorithms: [algorithm],
                    issuer,
                    subject,
                }) as T,
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
