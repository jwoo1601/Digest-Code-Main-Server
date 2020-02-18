import { IPost } from './post';
import { IResource } from './resource';
import { ICommentable } from './comment';

export interface ICourseChapter {
    title: string;
    summary: string;
    notes?: IPost[];
    released: boolean;

    videoLecture?: IResource;
}

export interface ICourse extends ICommentable {
    code: string;
    name: string;
    description: string;
    chapters: ICourseChapter[];
    languages?: string[];
}

export interface IEnrolledCourse {
    course: ICourse;
    enrolledAt: Date;
    completed: boolean;
    completedAt?: Date;
}
