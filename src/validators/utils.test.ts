import { ValidationUtils } from './utils';
import { InvalidArgumentError } from '../internals/errors';

test('ValidationUtils.isString(undefined)', () => {
    expect(ValidationUtils.isString(undefined)).toBe(false);
});

test('ValidationUtils.isString(null)', () => {
    expect(ValidationUtils.isString(null)).toBe(false);
});

test('ValidationUtils.isString("")', () => {
    expect(ValidationUtils.isString('')).toBe(true);
});

test('ValidationUtils.isString("test")', () => {
    expect(ValidationUtils.isString('test')).toBe(true);
});

test('ValidationUtils.isString(String("test"))', () => {
    expect(ValidationUtils.isString(String('test'))).toBe(true);
});

test('ValidationUtils.getString(123)', () => {
    expect(() => ValidationUtils.getString(123)).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getString("test")', () => {
    expect(() => ValidationUtils.getString('test')).not.toThrow();
    expect(ValidationUtils.getString('test')).toBe('test');
});

test('ValidationUtils.getString(String("test"))', () => {
    expect(() => ValidationUtils.getString(String('test'))).not.toThrow();
    expect(ValidationUtils.getString(String('test'))).toBe('test');
});

////////////////////////////////////////////////////////////

test('ValidationUtils.isNumber(undefined)', () => {
    expect(ValidationUtils.isNumber(undefined)).toBe(false);
});

test('ValidationUtils.isNumber(null)', () => {
    expect(ValidationUtils.isNumber(null)).toBe(false);
});

test('ValidationUtils.isNumber("test")', () => {
    expect(ValidationUtils.isNumber('test')).toBe(false);
});

test('ValidationUtils.isNumber({})', () => {
    expect(ValidationUtils.isNumber({})).toBe(false);
});

test('ValidationUtils.isNumber(NaN)', () => {
    expect(ValidationUtils.isNumber(NaN)).toBe(false);
});

test('ValidationUtils.isNumber(123)', () => {
    expect(ValidationUtils.isNumber(123)).toBe(true);
});

test('ValidationUtils.isNumber("test")', () => {
    expect(ValidationUtils.isNumber('test')).toBe(false);
});

test('ValidationUtils.isNumber(Number(123.456))', () => {
    expect(ValidationUtils.isNumber(Number(123.456))).toBe(true);
});

test('ValidationUtils.isNumber(Number())', () => {
    expect(ValidationUtils.isNumber(Number())).toBe(true);
});

test('ValidationUtils.isNumber(-Infinity)', () => {
    expect(ValidationUtils.isNumber(-Infinity)).toBe(true);
});

test('ValidationUtils.getNumber("test")', () => {
    expect(() => ValidationUtils.getNumber('test')).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getNumber({})', () => {
    expect(() => ValidationUtils.getNumber({})).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getNumber(NaN)', () => {
    expect(() => ValidationUtils.getNumber(NaN)).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getNumber(123.456)', () => {
    expect(() => ValidationUtils.getNumber(123.456)).not.toThrow();
    expect(ValidationUtils.getNumber(123.456)).toBe(123.456);
});

test('ValidationUtils.getNumber(Number())', () => {
    expect(() => ValidationUtils.getNumber(Number())).not.toThrow();
    expect(ValidationUtils.getNumber(Number())).toBe(0);
});

test('ValidationUtils.getNumber(Infinity)', () => {
    expect(() => ValidationUtils.getNumber(Infinity)).not.toThrow();
    expect(ValidationUtils.getNumber(Infinity)).toBe(Infinity);
});

test('ValidationUtils.getNumber("123.456")', () => {
    expect(() => ValidationUtils.getNumber('123.456')).not.toThrow();
    expect(ValidationUtils.getNumber('123.456')).toBe(123.456);
});

//////////////////////////////////////////////////////////////
test('ValidationUtils.isBoolean(undefined)', () => {
    expect(ValidationUtils.isBoolean(undefined)).toBe(false);
});

test('ValidationUtils.isBoolean(null)', () => {
    expect(ValidationUtils.isBoolean(null)).toBe(false);
});

test('ValidationUtils.isBoolean("test")', () => {
    expect(ValidationUtils.isBoolean('test')).toBe(false);
});

test('ValidationUtils.isBoolean({})', () => {
    expect(ValidationUtils.isBoolean({})).toBe(false);
});

test('ValidationUtils.isBoolean(NaN)', () => {
    expect(ValidationUtils.isBoolean(NaN)).toBe(false);
});

test('ValidationUtils.isBoolean(123)', () => {
    expect(ValidationUtils.isBoolean(123)).toBe(false);
});

test('ValidationUtils.isBoolean("test")', () => {
    expect(ValidationUtils.isBoolean('test')).toBe(false);
});

test('ValidationUtils.isBoolean(true)', () => {
    expect(ValidationUtils.isBoolean(true)).toBe(true);
});

test('ValidationUtils.isBoolean(Boolean())', () => {
    expect(ValidationUtils.isBoolean(Boolean())).toBe(true);
});

test('ValidationUtils.isBoolean("false")', () => {
    expect(ValidationUtils.isBoolean('false')).toBe(true);
});

test('ValidationUtils.getBoolean("test")', () => {
    expect(() => ValidationUtils.getBoolean('test')).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getBoolean({})', () => {
    expect(() => ValidationUtils.getBoolean({})).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getBoolean(NaN)', () => {
    expect(() => ValidationUtils.getBoolean(NaN)).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getBoolean("tru")', () => {
    expect(() => ValidationUtils.getBoolean('tru')).toThrowError(
        InvalidArgumentError,
    );
});

test('ValidationUtils.getBoolean(true)', () => {
    expect(() => ValidationUtils.getBoolean(true)).not.toThrow();
    expect(ValidationUtils.getBoolean(true)).toBe(true);
});

test('ValidationUtils.getBoolean(false)', () => {
    expect(() => ValidationUtils.getBoolean(false)).not.toThrow();
    expect(ValidationUtils.getBoolean(false)).toBe(false);
});

test('ValidationUtils.getBoolean("true")', () => {
    expect(() => ValidationUtils.getBoolean('true')).not.toThrow();
    expect(ValidationUtils.getBoolean('true')).toBe(true);
});

test('ValidationUtils.getBoolean("false")', () => {
    expect(() => ValidationUtils.getBoolean('false')).not.toThrow();
    expect(ValidationUtils.getBoolean('false')).toBe(false);
});
