import { Schema, Document, Model, model } from 'mongoose';

import { ICourse } from '../interfaces/course';
import { PostSchema } from './post';
import {
    generateDocumentCreator,
    convertDocumentToId,
} from './documentCreator';
import { Commentable } from './comment';

const autoPopulate = require('mongoose-autopopulate');

export const CourseChapterSchema: Schema = new Schema({
    title: {
        type: String,
        requried: true,
    },
    summary: {
        type: String,
        required: true,
    },
    notes: {
        type: [PostSchema],
        default: [],
        select: false,
    },
    released: {
        type: Boolean,
        required: true,
        default: false,
    },
    videoLecture: {
        type: Schema.Types.ObjectId,
        ref: 'Resource',
        autopopulate: true,
        select: false,
    },
});

CourseChapterSchema.plugin(autoPopulate);

export const createCourseChapter = generateDocumentCreator({
    videoLecture: convertDocumentToId,
});

export interface ICourseModel extends ICourse, Document {}

export const CourseSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    chapters: {
        type: [CourseChapterSchema],
        default: [],
        select: false,
    },
    languages: {
        type: [String],
        default: [],
        select: false,
    },
});

export const Course = Commentable.discriminator<ICourseModel>(
    'Course',
    CourseSchema,
);
