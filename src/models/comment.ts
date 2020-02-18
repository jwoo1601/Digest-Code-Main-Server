import { Schema, Document, Model, model } from 'mongoose';
import { ICommentable, IComment } from '../interfaces/comment';
import {
    generateDocumentCreator,
    convertDocumentToId,
} from './documentCreator';
import { LikeSchema } from './likeable';

const autoPopulate = require('mongoose-autopopulate');

export interface ICommentModel extends IComment, Document {}

export const CommentSchema: Schema = new Schema({
    body: {
        type: String,
        required: true,
    },
    commentedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        autopopulate: true,
    },
    commentedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    lastModifiedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },

    // ILikeable Interface
    likes: {
        type: [LikeSchema],
        required: true,
        default: [],
    },
});

CommentSchema.plugin(autoPopulate);

export const createComment = generateDocumentCreator({
    commentedBy: convertDocumentToId,
});

export interface ICommentableModel extends ICommentable, Document {}

const CommentableSchema: Schema = new Schema({
    comments: {
        type: [CommentSchema],
        required: true,
        default: [],
    },
});

export const Commentable: Model<ICommentableModel> = model<ICommentableModel>(
    'Commentable',
    CommentableSchema,
);
