import { IValidator, IValidationResult } from '../interfaces/validator';
import { ValidationUtils } from './utils';
import validator from 'validator';

export interface ICourseQueryData {
    page: number;
    limit: number;
    name: string;
    detailed: boolean;
    unleash: boolean;
}

export class CourseQueryValidator implements IValidator<ICourseQueryData> {
    validate(
        data: any,
        defaults: ICourseQueryData,
    ): IValidationResult<ICourseQueryData> {
        const result: IValidationResult<ICourseQueryData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.page)) {
            if (
                ValidationUtils.isNumber(data.page) &&
                validator.isInt(data.page)
            ) {
                const page = ValidationUtils.getNumber(data.page);
                if (page >= 0) {
                    result.validated.page = page;
                } else {
                    result.errors.push({
                        field: 'page',
                        message: 'page must be greater than 0',
                    });
                }
            } else {
                result.errors.push({
                    field: 'page',
                    message: 'page must be an integer',
                });
            }
        }

        if (ValidationUtils.isDefined(data.limit)) {
            if (
                ValidationUtils.isNumber(data.limit) &&
                validator.isInt(data.limit)
            ) {
                const limit = ValidationUtils.getNumber(data.limit);
                if (limit >= 0) {
                    result.validated.limit = limit;
                } else {
                    result.errors.push({
                        field: 'limit',
                        message: 'limit must be greater than 0',
                    });
                }
            } else {
                result.errors.push({
                    field: 'limit',
                    message: 'limit must be an integer',
                });
            }
        }

        if (ValidationUtils.isDefined(data.name)) {
            if (ValidationUtils.isString(data.name)) {
                result.validated.name = ValidationUtils.getString(data.name);
            } else {
                result.errors.push({
                    field: 'name',
                    message: 'name must be a string',
                });
            }
        }

        if (ValidationUtils.isDefined(data.detailed)) {
            if (ValidationUtils.isBoolean(data.detailed)) {
                result.validated.detailed = ValidationUtils.getBoolean(
                    data.detailed,
                );
            }
        }

        if (ValidationUtils.isDefined(data.unleash)) {
            if (ValidationUtils.isBoolean(data.unleash)) {
                result.validated.unleash = ValidationUtils.getBoolean(
                    data.unleash,
                );
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}

export interface ICoursePostData {
    code: string;
    name: string;
    description: string;
    languages?: string[];
}

export class CoursePostValidator implements IValidator<ICoursePostData> {
    validate(
        data: any,
        defaults: ICoursePostData,
    ): IValidationResult<ICoursePostData> {
        const result: IValidationResult<ICoursePostData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.code)) {
            if (ValidationUtils.isString(data.code)) {
                const code = ValidationUtils.getString(data.code);
                result.validated.code = code;
            } else {
                result.errors.push({
                    field: 'code',
                    message: 'code must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'code',
                message: 'code is required',
            });
        }

        if (ValidationUtils.isDefined(data.name)) {
            if (ValidationUtils.isString(data.name)) {
                const name = ValidationUtils.getString(data.name);
                result.validated.name = name;
            } else {
                result.errors.push({
                    field: 'name',
                    message: 'name must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'name',
                message: 'name is required',
            });
        }

        if (ValidationUtils.isDefined(data.description)) {
            if (ValidationUtils.isString(data.description)) {
                const description = ValidationUtils.getString(data.description);
                result.validated.description = description;
            } else {
                result.errors.push({
                    field: 'description',
                    message: 'description must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'description',
                message: 'description is required',
            });
        }

        if (ValidationUtils.isDefined(data.languages)) {
            if (ValidationUtils.isString(data.languages)) {
                const languages = ValidationUtils.getString(
                    data.languages,
                ).split(',');
                result.validated.languages = languages;
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}

export interface ICourseEditData {
    name: string;
    description: string;
    languages?: string[];
}

export class CourseEditValidator implements IValidator<ICourseEditData> {
    validate(
        data: any,
        defaults: ICourseEditData,
    ): IValidationResult<ICourseEditData> {
        const result: IValidationResult<ICourseEditData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.name)) {
            if (ValidationUtils.isString(data.name)) {
                const name = ValidationUtils.getString(data.name);
                result.validated.name = name;
            } else {
                result.errors.push({
                    field: 'name',
                    message: 'name must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'name',
                message: 'name is required',
            });
        }

        if (ValidationUtils.isDefined(data.description)) {
            if (ValidationUtils.isString(data.description)) {
                const description = ValidationUtils.getString(data.description);
                result.validated.description = description;
            } else {
                result.errors.push({
                    field: 'description',
                    message: 'description must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'description',
                message: 'description is required',
            });
        }

        if (ValidationUtils.isDefined(data.languages)) {
            if (ValidationUtils.isString(data.languages)) {
                const languages = ValidationUtils.getString(
                    data.languages,
                ).split(',');
                result.validated.languages = languages;
            }
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
