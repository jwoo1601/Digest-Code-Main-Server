import { IUser } from './user';

export interface IPayment {
    payer: IUser;
    chargedAmount: number;
    chargedAt: Date;
    paidAmount: number;
    currency: string;
}

export interface IPaymentHistory {
    payment: IPayment;
    amount: number;
    paidAt: Date;
}
