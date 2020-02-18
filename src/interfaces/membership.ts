import { IPermissionProp, EPermissionTypes } from './permission';

export interface IMembership {
    name: string;

    [EPermissionTypes.USER]: IPermissionProp;
    [EPermissionTypes.USER_PROFILE]: IPermissionProp;
    [EPermissionTypes.USER_PAYMENT]: IPermissionProp;
    [EPermissionTypes.POST]: IPermissionProp;
    [EPermissionTypes.POST_COMMENT]: IPermissionProp;
    [EPermissionTypes.COURSE]: IPermissionProp;
    [EPermissionTypes.COURSE_DETAIL]: IPermissionProp;
    [EPermissionTypes.COURSE_NOTE]: IPermissionProp;
    [EPermissionTypes.COURSE_COMMENT]: IPermissionProp;
    [EPermissionTypes.COURSE_VIDEO_LECTURE]: IPermissionProp;
    [EPermissionTypes.SANDBOX]: IPermissionProp;
    [EPermissionTypes.CLIENT]: IPermissionProp;
}
