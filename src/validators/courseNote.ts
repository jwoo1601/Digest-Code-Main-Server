import { IValidator, IValidationResult } from '../interfaces/validator';
import { ValidationUtils } from './utils';
import validator from 'validator';

export interface ICourseNoteData {
    chapter: number;
    unleash: boolean;
}

export class CourseNoteValidator implements IValidator<ICourseNoteData> {
    validate(
        data: any,
        defaults: ICourseNoteData,
    ): IValidationResult<ICourseNoteData> {
        const result: IValidationResult<ICourseNoteData> = {
            valid: false,
            validated: { ...defaults },
            errors: [],
        };

        if (ValidationUtils.isDefined(data.chapter)) {
            if (
                ValidationUtils.isNumber(data.chapter) &&
                validator.isInt(data.chapter)
            ) {
                const chapter = ValidationUtils.getNumber(data.chapter);
                if (chapter >= 0) {
                    result.validated.chapter = chapter;
                } else {
                    result.errors.push({
                        field: 'chapter',
                        message: 'chapter must be greater than 0',
                    });
                }
            } else {
                result.errors.push({
                    field: 'chapter',
                    message: 'chapter must be an integer',
                });
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
