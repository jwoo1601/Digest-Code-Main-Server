import { IUser } from './user';
import { ILikeable } from './likeable';

export interface IComment {
    body: string;
    commentedBy: IUser;
    commentedAt: Date;
    lastModifiedAt: Date;
    deleted: boolean;
    deletedAt: Date;
}

export interface ILikeableComment extends IComment, ILikeable {}

export interface ICommentable {
    comments: IComment[];
}
