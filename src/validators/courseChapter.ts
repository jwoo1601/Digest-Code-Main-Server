import { IValidationResult, IValidator } from '../interfaces/validator';
import { ValidationUtils } from './utils';

export interface ICourseChapterData {
    title: string;
    summary: string;
    released: boolean;
}

export class CourseChapterValidator implements IValidator<ICourseChapterData> {
    validate(
        data: any,
        defaults: ICourseChapterData,
    ): IValidationResult<ICourseChapterData> {
        const result: IValidationResult<ICourseChapterData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.title)) {
            if (ValidationUtils.isString(data.title)) {
                const title = ValidationUtils.getString(data.title);
                result.validated.title = title;
            } else {
                result.errors.push({
                    field: 'title',
                    message: 'title must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'title',
                message: 'title is required',
            });
        }

        if (ValidationUtils.isDefined(data.summary)) {
            if (ValidationUtils.isString(data.summary)) {
                const summary = ValidationUtils.getString(data.summary);
                result.validated.summary = summary;
            } else {
                result.errors.push({
                    field: 'summary',
                    message: 'summary must be a string',
                });
            }
        } else {
            result.errors.push({
                field: 'summary',
                message: 'summary is required',
            });
        }

        if (ValidationUtils.isDefined(data.released)) {
            if (ValidationUtils.isBoolean(data.released)) {
                const released = ValidationUtils.getBoolean(data.released);
                result.validated.released = released;
            } else {
                result.errors.push({
                    field: 'released',
                    message: 'released must be a boolean',
                });
            }
        } else {
            result.errors.push({
                field: 'released',
                message: 'released is required',
            });
        }

        if (result.errors.length == 0) {
            result.valid = true;
        }

        return result;
    }
}
