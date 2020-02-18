export const database = {
    main: {
        dbName: process.env.MAIN_DB_NAME,
        host: process.env.MAIN_DB_HOST,
        username: process.env.MAIN_DB_USERNAME,
        password: process.env.MAIN_DB_PASSWORD,
    },
};

export const authentication = {
    jwt: {
        secret: process.env.JWT_AUTH_SECRET,
        algorithm: process.env.JWT_AUTH_ALGORITHM,
        issuer: process.env.TOKEN_ISSUER,
        subject: process.env.JWT_AUTH_SUBJECT,
        expiresIn: String(30 * 60 * 60), // 20 mins
    },
};

export const authorization = {
    firstParty: {
        accessToken: {
            secret: process.env.FIRST_PARTY_ACCESS_TOKEN_SECRET,
            algorithm: process.env.FIRST_PARTY_ACCESS_TOKEN_ALGORITHM,
            issuer: process.env.TOKEN_ISSUER,
            subject: process.env.FIRST_PARTY_ACCESS_TOKEN_SUBJECT,
            expiresIn: String(30 * 60 * 60),
        }
    },
    oauth2: {
        clientToken: {
            secret: process.env.OAUTH2_CLIENT_TOKEN_SECRET,
            algorithm: process.env.OAUTH2_CLIENT_TOKEN_ALGORITHM,
            issuer: process.env.TOKEN_ISSUER,
            subject: process.env.OAUTH2_CLIENT_TOKEN_SUBJECT,
            expiresIn: String(10 * 60 * 60),
        },
        accessToken: {
            secret: process.env.OAUTH2_ACCESS_TOKEN_SECRET,
            algorithm: process.env.OAUTH2_ACCESS_TOKEN_ALGORITHM,
            issuer: process.env.TOKEN_ISSUER,
            subject: process.env.OAUTH2_ACCESS_TOKEN_SUBJECT,
            expiresIn: String(30 * 60 * 60),
        },
        refreshToken: {
            secret: process.env.OAUTH2_ACCESS_TOKEN_SECRET,
            algorithm: process.env.OAUTH2_ACCESS_TOKEN_ALGORITHM,
            issuer: process.env.TOKEN_ISSUER,
            subject: process.env.OAUTH2_ACCESS_TOKEN_SUBJECT,
            expiresIn: String(60 * 60 * 60),
        }
    },
}

export const storage = {
    local: {
        storagePath: process.env.LOCAL_STORAGE_PATH,
    },
    remote: {
        hostname: process.env.REMOTE_HOST,
        accessKey: process.env.REMOTE_ACCESS_KEY,
    },
    'azure-blob': {
        accountName: process.env.AZURE_BLOB_ACCOUNT_NAME,
        primaryAccessKey: process.env.AZURE_BLOB_PRIMARY_ACCESS_KEY,
        secondaryAccessKey: process.env.AZURE_BLOB_SECONDARY_ACCESS_KEY,
    },
};