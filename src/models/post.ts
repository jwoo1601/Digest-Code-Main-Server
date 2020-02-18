import { Schema, Document, Model, model } from 'mongoose';

import { IPost } from '../interfaces/post';

export const PostResourceSchema: Schema = new Schema({
    resource: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Resource',
        autopopulate: true,
    },
    alias: {
        type: String,
        required: true,
    },
});

PostResourceSchema.plugin(require('mongoose-autopopulate'));

export interface IPostModel extends IPost, Document {}

export const PostSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        default: '',
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        autopopulate: true,
    },
    resources: {
        type: [PostResourceSchema],
        default: [],
    },
    commentable: {
        type: Boolean,
        required: true,
        default: true,
    },
    comments: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        default: [],
    },
    likeable: {
        type: Boolean,
        required: true,
        default: true,
    },
    likedUsers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        default: [],
    },
});

PostSchema.plugin(require('mongoose-autopopulate'));

export const Post: Model<IPostModel> = model<IPostModel>('Post', PostSchema);
