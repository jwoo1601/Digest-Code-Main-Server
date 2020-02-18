export interface IValidationError {
    field: string;
    message: string;
}

export interface IValidationResult<T> {
    valid: boolean;
    validated: T;
    errors: IValidationError[];
}

export interface IValidator<T> {
    validate(data: any, defaults: T): IValidationResult<T>;
}
