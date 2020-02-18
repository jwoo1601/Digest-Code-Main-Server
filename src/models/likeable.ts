import { Schema, Document, Model, model } from 'mongoose';
import { ILikeable, ILike } from '../interfaces/likeable';
import {
    generateDocumentCreator,
    convertDocumentToId,
} from './documentCreator';

const autoPopulate = require('mongoose-autopopulate');

export interface ILikeModel extends ILike, Document {}

export const LikeSchema = new Schema({
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true,
    },
    likedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

LikeSchema.plugin(autoPopulate);

export interface ILikeableModel extends ILikeable, Document {}

export const LikeableSchema = new Schema({
    likes: {
        type: [LikeSchema],
        required: true,
        default: [],
    },
});

export const createLike = generateDocumentCreator({
    likedBy: convertDocumentToId,
});

export const Likeable: Model<ILikeableModel> = model<ILikeableModel>(
    'Likeable',
    LikeableSchema,
);
