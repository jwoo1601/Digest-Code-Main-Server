import { Schema, Document, Model, model } from 'mongoose';
import { ISandbox } from '../interfaces/sandbox';

export const SandboxPackageSchema: Schema = new Schema({
    entryPoint: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Resource',
        autopopulate: true,
    },
});

SandboxPackageSchema.plugin(require('mongoose-autopopulate'));

export interface ISandboxModel extends ISandbox, Document {}

export const SandboxSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        autopopulate: true,
    },
    environment: {
        type: String,
        required: true,
    },
    isolated: {
        type: Boolean,
        required: true,
    },
    privacyPolicy: {
        type: String,
        required: true,
    },
    storage: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ResourceNamespace',
        autopopulate: true,
    },
    packages: {
        type: [SandboxPackageSchema],
        default: [],
    },
    allowedUsers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        default: [],
    },
});

SandboxSchema.plugin(require('mongoose-autopopulate'));

export const Sandbox: Model<ISandboxModel> = model<ISandboxModel>(
    'Sandbox',
    SandboxSchema,
);
