import { IValidator, IValidationResult } from '../interfaces/validator';
import { ValidationUtils } from './utils';
import validator from 'validator';

export interface IClientRegistrationData {
    name: string;
    description: string;
}

export class ClientRegistrationValidator
    implements IValidator<IClientRegistrationData> {
    validate(
        data: any,
        defaults: IClientRegistrationData,
    ): IValidationResult<IClientRegistrationData> {
        const result: IValidationResult<IClientRegistrationData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.name)) {
            if (
                ValidationUtils.isString(data.name) &&
                validator.matches(data.name, /^[a-zA-Z_][a-zA-Z0-9_-]*$/)
            ) {
                result.validated.name = ValidationUtils.getString(data.name);
            } else {
                result.errors.push({
                    field: 'name',
                    message: 'Client name must only contain valid characters',
                });
            }
        } else {
            result.errors.push({
                field: 'name',
                message: 'Client name is required',
            });
        }

        if (ValidationUtils.isDefined(data.description)) {
            if (ValidationUtils.isString(data.description)) {
                result.validated.description = ValidationUtils.getString(
                    data.description,
                );
            } else {
                result.errors.push({
                    field: 'Description',
                    message: 'Description must be a string',
                });
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
