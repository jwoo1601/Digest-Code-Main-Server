import { IUser } from './user';

export interface ILike {
    likedBy: IUser;
    likedAt: Date;
}

export interface ILikeable {
    likes: ILike[];
}
