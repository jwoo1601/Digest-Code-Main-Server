import { IMembership } from './membership';
import { ICourse, IEnrolledCourse } from './course';
import { IResource } from './resource';

export interface IUser {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    birthDate: Date;
    primaryContact?: string;
    secondaryContact?: string;
    membership: IMembership;
    location: String;
    registeredAt: Date;
    enrolledCourses: IEnrolledCourse[];
    favoriteCourses: ICourse[];
    preferredLanguage?: String;
    profileImage?: IResource;
}
