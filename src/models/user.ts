import { Schema, HookNextFunction, Document, Model, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
import locales from 'iso-639-1';

import { IUser } from '../interfaces/user';
import {
    generateDocumentCreator,
    convertDocumentToId,
    convertDocumentArrayToIdArray,
} from './documentCreator';
import { Logging } from '../logging';

const autoPouplate = require('mongoose-autopopulate');

export const EnrolledCourseSchema: Schema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
        autopopulate: true,
    },
    enrolledAt: {
        type: Date,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
    completedAt: {
        type: Date,
    },
});

EnrolledCourseSchema.plugin(autoPouplate);

export const createEnrolledCourse = generateDocumentCreator({
    course: convertDocumentToId,
});

export interface IUserModel extends IUser, Document {
    validatePassword(incomingPassword: string): Promise<boolean>;
}

export const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        select: false,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    primaryContact: {
        type: String,
        select: false,
    },
    secondaryContact: {
        type: String,
        select: false,
    },
    membership: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Membership',
        autopopulate: true,
    },
    location: {
        type: String,
        select: false,
    },
    registeredAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    enrolledCourses: {
        type: [EnrolledCourseSchema],
        default: [],
        select: false,
    },
    favoriteCourses: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Course',
                autopopulate: true,
            },
        ],
        default: [],
        select: false,
    },
    preferredLanguage: {
        type: String,
        default: locales.getCode('English'),
        select: false,
    },
    profileImage: {
        type: Schema.Types.ObjectId,
        ref: 'Resource',
        autopopulate: true,
        select: false,
    },
});

UserSchema.methods.validatePassword = async function(incomingPassword: string) {
    try {
        return await compare(this.password, incomingPassword);
    } catch (err) {
        const logger = await Logging.getOrCreateLogger('user');
        logger.error(`Failed to validate password of User {${this.username}}`);
    }

    return false;
};

UserSchema.pre('save', async function(next: HookNextFunction) {
    try {
        let randomSalt = await genSalt();
        this.set('password', await hash(this.get('password'), randomSalt));

        next();
    } catch (e) {
        const logger = await Logging.getOrCreateLogger('user');
        logger.error(
            `Failed to save user data of User {${this.get('username')}}`,
        );
    }
});

UserSchema.plugin(autoPouplate);

export const createUser = generateDocumentCreator<IUser>({
    membership: convertDocumentToId,
    enrolledCourses: (documentArray: Document[]) =>
        documentArray.map(createEnrolledCourse),
    favoriteCourses: convertDocumentArrayToIdArray,
    profileImage: convertDocumentToId,
});

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
