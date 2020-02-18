import { Schema, Document, Model, model } from 'mongoose';
import { IPayment, IPaymentHistory } from '../interfaces/payment';

export interface IPaymentModel extends IPayment, Document {}

export const PaymentSchema: Schema = new Schema({
    payer: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        autopopulate: true,
    },
    chargedAmount: {
        type: Number,
        required: true,
    },
    chargedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: 'CAD',
    },
});

PaymentSchema.plugin(require('mongoose-autopopulate'));

export interface IPaymentHistoryModel extends IPaymentHistory, Document {}

export const PaymentHistorySchema: Schema = new Schema({
    payment: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Payment',
        autopopulate: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paidAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

PaymentHistorySchema.plugin(require('mongoose-autopopulate'));

export const Payment: Model<IPaymentModel> = model<IPaymentModel>(
    'Payment',
    PaymentSchema,
);

export const PaymentHistory: Model<IPaymentHistoryModel> = model<
    IPaymentHistoryModel
>('PaymentHistory', PaymentHistorySchema);
