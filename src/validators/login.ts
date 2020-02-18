import { IValidator, IValidationResult } from '../interfaces/validator';
import { ValidationUtils } from './utils';
import validator from 'validator';

export interface ILoginData {
    username: string;
    password: string;
}

export class LoginValidator implements IValidator<ILoginData> {
    validate(data: any, defaults: ILoginData): IValidationResult<ILoginData> {
        const result: IValidationResult<ILoginData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.username)) {
            if (ValidationUtils.isString(data.username)) {
                result.validated.username = ValidationUtils.getString(
                    data.username,
                );
            } else {
                result.errors.push({
                    field: 'username',
                    message: 'Username must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'username',
                message: 'Username is required',
            });
        }

        if (ValidationUtils.isDefined(data.password)) {
            if (ValidationUtils.isString(data.password)) {
                result.validated.password = ValidationUtils.getString(
                    data.password,
                );
            } else {
                result.errors.push({
                    field: 'password',
                    message: 'Password must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'password',
                message: 'Password is required',
            });
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
