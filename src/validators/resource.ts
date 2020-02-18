import { IValidator, IValidationResult } from '../interfaces/validator';
import { ValidationUtils } from './utils';
import validator from 'validator';
import {
    EResourceType,
    EResourceNamespaceLocation,
} from '../interfaces/resource';

export interface IResourceQueryData {
    location: EResourceNamespaceLocation;
    type: EResourceType;
    inline: boolean;
}

export class ResourceQueryValidator implements IValidator<IResourceQueryData> {
    validate(
        data: any,
        defaults: IResourceQueryData,
    ): IValidationResult<IResourceQueryData> {
        const result: IValidationResult<IResourceQueryData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (data.location) {
            if (data.location in EResourceNamespaceLocation) {
                result.validated.location = data.location;
            } else {
                result.errors.push({
                    field: 'location',
                    message: 'Location is not valid resource storage location',
                });
            }
        }

        if (data.type) {
            if (data.type in EResourceType) {
                result.validated.type = data.type;
            } else {
                result.errors.push({
                    field: 'type',
                    message: 'Type is not valid resource type',
                });
            }
        }

        if (data.inline) {
            if (ValidationUtils.isBoolean(data.inline)) {
                result.validated.inline = ValidationUtils.getBoolean(
                    data.inline,
                );
            } else {
                result.errors.push({
                    field: 'inline',
                    message: 'Inline is not a boolean',
                });
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}

export interface IResourceNameQueryData extends IResourceQueryData {
    name: string;
    category: string;
}

export class ResourceNameQueryValidator extends ResourceQueryValidator {
    validate(
        data: any,
        defaults: IResourceNameQueryData,
    ): IValidationResult<IResourceNameQueryData> {
        const baseResult = super.validate(data, defaults);
        const result: IValidationResult<IResourceNameQueryData> = {
            valid: false,
            validated: { ...defaults, ...baseResult.validated },
            errors: [...baseResult.errors],
        };

        if (data.name) {
            if (ValidationUtils.isString(data.name)) {
                result.validated.name = ValidationUtils.getString(data.name);
            } else {
                result.errors.push({
                    field: 'name',
                    message: 'Name is not a string',
                });
            }
        }

        if (data.category) {
            if (ValidationUtils.isString(data.category)) {
                result.validated.category = ValidationUtils.getString(
                    data.category,
                );
            } else {
                result.errors.push({
                    field: 'category',
                    message: 'Category is not a string',
                });
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}

export interface IResourceRIDQueryData extends IResourceQueryData {
    rid: string;
}

export class ResourceRIDQueryValidator extends ResourceQueryValidator {
    validate(
        data: any,
        defaults: IResourceRIDQueryData,
    ): IValidationResult<IResourceRIDQueryData> {
        const baseResult = super.validate(data, defaults);
        const result: IValidationResult<IResourceRIDQueryData> = {
            valid: false,
            validated: { ...defaults, ...baseResult.validated },
            errors: [...baseResult.errors],
        };

        if (data.rid) {
            if (validator.isUUID(data.rid, '5')) {
                result.validated.rid = ValidationUtils.getString(data.rid);
            } else {
                result.errors.push({
                    field: 'rid',
                    message: 'Rid is not a valid rid',
                });
            }
        } else {
            result.errors.push({
                field: 'rid',
                message: 'Rid is required',
            });
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
