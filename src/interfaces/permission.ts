export enum EPermission {
    NO_ACCESS = 'no-access',
    LIMITED_ACCESS = 'limited-access',
    FULL_ACCESS = 'full-access',
}

export enum EPermissionPropTypes {
    VIEW = 'view',
    CREATE = 'create',
    MODIFY = 'modify',
    DELETE = 'delete',
}

export enum EPermissionTypes {
    USER = 'user',
    USER_PROFILE = 'user/profile',
    USER_PAYMENT = 'user/payment',

    POST = 'post',
    POST_COMMENT = 'post/comment',

    COURSE = 'courses',
    COURSE_DETAIL = 'course/detail',
    COURSE_NOTE = 'course/note',
    COURSE_COMMENT = 'course/comment',
    COURSE_VIDEO_LECTURE = 'course/video-lecture',

    SANDBOX = 'sandbox',

    CLIENT = 'client',
}

export interface IPermission {
    type: EPermissionTypes;
    prop: EPermissionPropTypes;
    value: EPermission;
}

export interface IPermissionProp {
    [EPermissionPropTypes.VIEW]: EPermission;
    [EPermissionPropTypes.CREATE]: EPermission;
    [EPermissionPropTypes.MODIFY]: EPermission;
    [EPermissionPropTypes.DELETE]: EPermission;
}

export interface IPermissionRequest {
    type: EPermissionTypes;
    prop: EPermissionPropTypes;
}

export class Permissions {
    static gt(value1: EPermission, value2: EPermission) {
        return (
            (value1 == EPermission.NO_ACCESS &&
                (value2 == EPermission.LIMITED_ACCESS ||
                    value2 == EPermission.FULL_ACCESS)) ||
            (value1 == EPermission.LIMITED_ACCESS &&
                value2 == EPermission.FULL_ACCESS)
        );
    }

    static ge(value1: EPermission, value2: EPermission) {
        return value1 == value2 || this.gt(value1, value2);
    }

    static lt(value1: EPermission, value2: EPermission) {
        return !this.ge(value1, value2);
    }

    static le(value1: EPermission, value2: EPermission) {
        return !this.gt(value1, value2);
    }
}
