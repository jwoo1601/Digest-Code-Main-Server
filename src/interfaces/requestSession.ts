export interface IRequestSession {
    key: string;
    exp: Date;
}

export const REQUEST_SESSION_HTTP_HEADER_NAME =
    'X-Digest-Code-Request-Session-Key';
