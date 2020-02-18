import validator from 'validator';
import { ValidationUtils } from './utils';
import { IValidator, IValidationResult } from '../interfaces/validator';

export interface IRegistrationData {
    username: string;
    password: string;
    passwordConfirm: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    birthDate: string;
}

export class UserRegisterValidator implements IValidator<IRegistrationData> {
    validate(
        data: any,
        defaults: IRegistrationData,
    ): IValidationResult<IRegistrationData> {
        const result: IValidationResult<IRegistrationData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (!data.username || validator.isEmpty(data.username)) {
            result.errors.push({
                field: 'username',
                message: 'Username is required',
            });
        } else if (!ValidationUtils.isUsername(data.username)) {
            result.errors.push({
                field: 'username',
                message:
                    'Username must only contain letters, digits, underscores, and dashes',
            });
        }

        if (!data.email || validator.isEmpty(data.email)) {
            result.errors.push({
                field: 'email',
                message: 'Email is required',
            });
        } else if (!validator.isEmail(data.email)) {
            result.errors.push({
                field: 'email',
                message: 'Email field is not in a valid email format',
            });
        }

        if (!data.password || validator.isEmpty(data.password)) {
            result.errors.push({
                field: 'password',
                message: 'Password is required',
            });
        }
        if (!data.passwordConfirm || validator.isEmpty(data.passwordConfirm)) {
            result.errors.push({
                field: 'passwordConfirm',
                message: 'Password confirmation is required',
            });
        }
        if (!validator.isLength(data.password, { min: 6, max: 30 })) {
            result.errors.push({
                field: 'password',
                message: 'Password must be 6-30 characters long',
            });
        }
        if (!validator.equals(data.password, data.passwordConfirm)) {
            result.errors.push({
                field: 'passwordConfirm',
                message: 'Password confirmation does not match password',
            });
        }

        if (!data.firstName || validator.isEmpty(data.firstName)) {
            result.errors.push({
                field: 'firstName',
                message: 'First name is required',
            });
        }
        if (!data.lastName || validator.isEmpty(data.lastName)) {
            result.errors.push({
                field: 'lastName',
                message: 'Last name is required',
            });
        }

        if (!data.birthDate || validator.isEmpty(data.birthDate)) {
            result.errors.push({
                field: 'birthDate',
                message: 'Birth date is required',
            });
        } else if (
            !(
                validator.toDate(data.birthDate) &&
                validator.isAfter(data.birthDate)
            )
        ) {
            result.errors.push({
                field: 'birthDate',
                message: 'Invalid birth date',
            });
        }

        if (
            data.phoneNumber &&
            !validator.isEmpty(data.phoneNumber) &&
            !validator.isMobilePhone(data.phoneNumber)
        ) {
            result.errors.push({
                field: 'phoneNumber',
                message: 'Invalid phone number',
            });
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
