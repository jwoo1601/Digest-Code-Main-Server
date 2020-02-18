import { IUser } from './user';
import { ICommentable } from './comment';
import { IResource } from './resource';
import { ILikeable } from './likeable';

export interface IPostResource extends IResource {
    alias: string;
}

export interface IPost extends ICommentable, ILikeable {
    title: string;
    body: string;
    author: IUser;
    resources: IPostResource[];
}
