import { InvalidArgumentError } from '../internals/errors';
import validator from 'validator';

export class ValidationUtils {
    static isDefined(value: any): boolean {
        return value !== undefined;
    }

    static hasMeaningfulValue(value: any): boolean {
        return value !== undefined && value !== null;
    }

    static isNumber(value: any): boolean {
        return (
            this.hasMeaningfulValue(value) &&
            !Number.isNaN(value) &&
            (typeof value === 'number' ||
                value instanceof Number ||
                !Number.isNaN(+value))
        );
    }

    static getNumber(value: any): number {
        if (this.isNumber(value)) {
            return +value;
        }

        throw new InvalidArgumentError('value', '{value} is not a number');
    }

    static isString(value: any): boolean {
        return (
            this.hasMeaningfulValue(value) &&
            (typeof value === 'string' || value instanceof String)
        );
    }

    static getString(value: any): string {
        if (this.isString(value)) {
            return value as string;
        }

        throw new InvalidArgumentError('value', '{value} is not a string');
    }

    static isBoolean(value: any): boolean {
        return (
            this.hasMeaningfulValue(value) &&
            (typeof value === 'boolean' ||
                (this.isString(value) &&
                    (value.toLowerCase() == 'true' ||
                        value.toLowerCase() == 'false')) ||
                value instanceof Boolean)
        );
    }

    static getBoolean(value: any): boolean {
        if (this.isBoolean(value)) {
            if (typeof value === 'boolean' || value instanceof Boolean) {
                return value as boolean;
            }

            return value === 'true';
        } else {
            throw new InvalidArgumentError('value', '{value} is not a boolean');
        }
    }

    static isUsername(value: any): boolean {
        return (
            this.isString(value) && validator.matches(value, /[a-zA-Z0-9_-]+/)
        );
    }

    static stringify(value: any): string {
        return value && this.isString(value) ? value : '';
    }

    static stringifyProperties(obj: object): object {
        let copy = { ...obj };

        Object.entries(copy).forEach(([k, v]) => {
            Object.defineProperty(copy, k, { value: this.stringify(v) });
        });

        return copy;
    }
}
