export interface IDigestCodeError {
    readonly message: string;
    readonly causedBy?: any;
}

export class DigestCodeError implements IDigestCodeError {
    message: string;
    causedBy?: any;

    constructor(message: string, causedBy?: any) {
        this.message = message;
        this.causedBy = causedBy;
    }
}

export class InvalidArgumentError extends DigestCodeError {
    constructor(
        argumentName: string,
        message: string = `Argument ${argumentName} is not valid`,
        causedBy?: any,
    ) {
        super(message, causedBy);
    }
}

export class DatabaseOperationError extends DigestCodeError {
    readonly databaseName: string;
    readonly operation: string;

    constructor(
        databaseName: string,
        operation: string,
        message: string = `Failed to perform a db operation {${operation}} on {${databaseName}}`,
        causedBy?: any,
    ) {
        super(message, causedBy);

        this.databaseName = databaseName;
        this.operation = operation;
    }
}

export class DataError extends DigestCodeError {
    readonly dataName: string;
    readonly source: string;

    constructor(
        dataName: string,
        source: string,
        message: string,
        causedBy?: Error | DigestCodeError,
    ) {
        super(message, causedBy);

        this.dataName = dataName;
        this.source = source;
    }
}

export class DataNotFoundError extends DataError {
    constructor(
        dataName: string,
        source: string,
        message: string = `Data {${dataName}} not found in {${source}}`,
        causedBy?: Error | DigestCodeError,
    ) {
        super(dataName, source, message, causedBy);
    }
}

export class DuplicateDataError extends DataError {
    constructor(
        dataName: string,
        source: string,
        message: string = `Duplicate data is not allowed for {${dataName}} in {${source}}`,
        causedBy?: Error | DigestCodeError,
    ) {
        super(dataName, source, message, causedBy);
    }
}
