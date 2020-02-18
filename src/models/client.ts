import { Schema, Document, model, Model } from 'mongoose';
import { IClient } from '../interfaces/client';

export interface IClientModel extends IClient, Document {}

export const ClientSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    secret: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
    },
    registeredAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

export const Client: Model<IClientModel> = model<IClientModel>(
    'Client',
    ClientSchema,
);
