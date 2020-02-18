export function isProductionMode() {
    return process.env.NODE_ENV == 'production';
}

export function isDevelopmentMode()  {
    return process.env.NODE_ENV == 'development';
}

export function isTestMode() {
    return process.nev.NODE_ENV == 'test';
}