import { Schema, Document, Model, model } from 'mongoose';
import { IRequestSession } from '../interfaces/requestSession';
import uuid from 'uuid';

export interface IRequestSessionModel extends IRequestSession, Document {}

export const RequestSessionSchema: Schema = new Schema({
    key: {
        type: String,
        required: true,
    },
    exp: {
        type: Date,
        required: true,
    },
});

RequestSessionSchema.statics.generateSessionKey = function(): string {
    return uuid.v4();
};

RequestSessionSchema.statics.getDateExpiresIn = function(
    expiresIn: number,
): Date {
    return new Date(Date.now() + expiresIn);
};

export const RequestSession: Model<IRequestSessionModel> = model<
    IRequestSessionModel
>('RequestSession', RequestSessionSchema);
