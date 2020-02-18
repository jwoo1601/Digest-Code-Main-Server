import { Response } from 'express';

/*
    This document lists all the codes used to identify the domain of each JSON repsonse from the Digest Code server.
*/

export class ResponseEx {
    private code: number;
    private status: number;
    private message: string;

    constructor(code: number, status: number, message: string) {
        this.code = code;
        this.status = status;
        this.message = message;
    }

    get Code(): number {
        return this.code;
    }

    get Status(): number {
        return this.status;
    }

    get Message(): string {
        return this.message;
    }

    send(res: Response, data?: object) {
        res.status(this.status).json({
            code: this.code,
            message: this.message,
            ...data,
        });
    }
}

export class InfoResponse extends ResponseEx {
    private static baseCode: number = 1000;
    private static counter: number = 0;

    constructor(status: number, message: string) {
        super(InfoResponse.baseCode + InfoResponse.counter, status, message);

        InfoResponse.counter += 1;
    }
}

export const INFO_SUCCESSFUL_QUERY = new InfoResponse(
    200,
    'Requested query has been processed successfully',
);

export const INFO_SUCCESSFUL_REGISTRATION = new InfoResponse(
    201,
    'Data registration success',
);

export const INFO_SUCCESSFUL_AUTHENTICATION = new InfoResponse(
    200,
    'Authentication success',
);

export const INFO_SUCCESSFUL_POSTING = new InfoResponse(
    201,
    'Successfully created a new post',
);

export const INFO_SUCCESSFUL_COMMENT_POSTING = new InfoResponse(
    201,
    'Successfully created a comment',
);

export const INFO_SUCCESSFUL_CLIENT_REGISTRATION = new InfoResponse(
    201,
    'Successfully registered a new API client',
);

export const INFO_SUCCESSFUL_DELETION = new InfoResponse(
    200,
    'Successfully deleted data',
);

export const INFO_SUCCESSFUL_MODIFICATION = new InfoResponse(
    200,
    'Successfully modified data',
);

export const INFO_REFERENCE_API_DOCUMENTATION = new InfoResponse(
    304,
    'See the documentation for available api routes',
);

export const INFO_REFERENCE_V1_DOCUMENTATION = new InfoResponse(
    304,
    'See the documentation for available v1 api routes',
);

export class ClientErrorResponse extends ResponseEx {
    private static baseCode: number = 4000;
    private static counter: number = 0;

    constructor(status: number, message: string) {
        super(
            ClientErrorResponse.baseCode + ClientErrorResponse.counter,
            status,
            message,
        );

        ClientErrorResponse.counter += 1;
    }
}

export const CLIENT_ERROR_INVALID_FIELD_INPUT = new ClientErrorResponse(
    400,
    'Invalid registration input fields',
);

export const CLIENT_ERROR_NO_PERMISSION = new ClientErrorResponse(
    401,
    'Not enough permissions',
);

export const CLIENT_ERROR_NO_SUCH_RESOURCE = new ClientErrorResponse(
    404,
    'No such resource found',
);

export const CLIENT_ERROR_NO_MATCHING_RESULT = new ClientErrorResponse(
    404,
    'No matching result found',
);

export const CLIENT_ERROR_NO_MATCHING_ROUTE = new ClientErrorResponse(
    404,
    'No matching route found',
);

export const CLIENT_ERROR_MEMBERSHIP_NOT_MATCHED = new ClientErrorResponse(
    401,
    'Membership of the current user does not match the required membership',
);

export const CLIENT_ERROR_INVALID_QUERY_STRING = new ClientErrorResponse(
    400,
    'Invalid query string',
);

export const CLIENT_ERROR_REQUEST_SESSION_EXPIRED = new ClientErrorResponse(
    400,
    'Current request session has already expired',
);

export const CLIENT_ERROR_INVALID_REQUEST_SESSION_KEY = new ClientErrorResponse(
    400,
    'Request session key is not valid',
);

export const CLIENT_ERROR_INCORRECT_USER_DATA = new ClientErrorResponse(
    400,
    'User data is incorrect',
);

export const CLIENT_ERROR_DUPLICATE_IDENTIFIER = new ClientErrorResponse(
    400,
    'Data identifier already exists',
);

export const CLIENT_ERROR_SERVICE_VERSION_NOT_SUPPORTED = new ClientErrorResponse(
    400,
    'Current service version is not supported',
);

export const CLIENT_ERROR_AUTHENTICATION_TOKEN_EXPIRED = new ClientErrorResponse(
    401,
    'Current authentication token has already expired',
);

export const CLIENT_ERROR_ACCESS_TOKEN_EXPIRED = new ClientErrorResponse(
    401,
    'Current access token has already expired',
);

export const CLIENT_ERROR_REFRESH_TOKEN_EXPIRED = new ClientErrorResponse(
    401,
    'Current refresh token has already expired',
);

export const CLIENT_ERROR_INVALID_AUTHENTICATION_TOKEN = new ClientErrorResponse(
    400,
    'Current authentication token is invalid',
);

export const CLIENT_ERROR_INVALID_ACCESS_TOKEN = new ClientErrorResponse(
    400,
    'Current access token is invalid',
);

export const CLIENT_ERROR_INVALID_REFRESH_TOKEN = new ClientErrorResponse(
    400,
    'Current refresh token is invalid',
);

export const CLIENT_ERROR_AUTHENTICATION_REQUIRED = new ClientErrorResponse(
    401,
    'Authentication is required',
);

export const CLIENT_ERROR_USER_NOT_FOUND = new ClientErrorResponse(
    400,
    'User not found',
);

export const CLIENT_ERROR_CLIENT_NOT_FOUND = new ClientErrorResponse(
    400,
    'Client not found',
);

export const CLIENT_ERROR_USER_ALREADY_AUTHENTICATED = new ClientErrorResponse(
    400,
    'Current user is already authenticated',
);

export const CLIENT_ERROR_INVALID_PARAMETER = new ClientErrorResponse(
    400,
    'Invalid parameter in url',
);

export class ServerErrorResponse extends ResponseEx {
    private static baseCode: number = 5000;
    private static counter: number = 0;

    constructor(status: number, message: string) {
        super(
            ServerErrorResponse.baseCode + ServerErrorResponse.counter,
            status,
            message,
        );

        ServerErrorResponse.counter += 1;
    }
}

export const SERVER_ERROR_GENERAL_OPERATION_FAILURE = new ServerErrorResponse(
    500,
    'Server operation failure',
);

export const SERVER_ERROR_DATABASE_OPERATION_FAILURE = new ServerErrorResponse(
    500,
    'Internal database operation failure',
);

export const SERVER_ERROR_TEMPORARY_OUT_OF_SERVICE = new ServerErrorResponse(
    503,
    'Currently out of service',
);
