import { Document, Schema, Model, model } from 'mongoose';
import { IResource, IResourceNamespace } from '../interfaces/resource';

export interface IResourceNamespaceModel extends IResourceNamespace, Document {}
export interface IResourceModel extends IResource, Document {}

export const ResourceNamespaceSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    uuid: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true,
    },
});

export const ResourceSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
    },
    namespace: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ResourceNamespace',
        autopopulate: true,
    },
    rid: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        default: '',
    },
    sourceName: {
        type: String,
    },
});

ResourceSchema.pre('save', function(next) {
    if (!this.get('sourceName')) {
        this.set('sourceName', this.get('rid'));
    }
});

ResourceSchema.plugin(require('mongoose-autopopulate'));

export const ResourceNamespace: Model<IResourceNamespaceModel> = model<
    IResourceNamespaceModel
>('ResourceNamespace', ResourceNamespaceSchema);
export const Resource: Model<IResourceModel> = model<IResourceModel>(
    'Resource',
    ResourceSchema,
);
