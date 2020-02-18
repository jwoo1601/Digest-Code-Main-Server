import { Document, Schema, Model, model } from 'mongoose';
import { IMembership } from '../interfaces/membership';
import {
    EPermissionTypes,
    EPermissionPropTypes,
} from '../interfaces/permission';

export interface IMembershipModel extends IMembership, Document {}

export const PermissionPropSchema = new Schema(
    {
        [EPermissionPropTypes.VIEW]: String,
        [EPermissionPropTypes.CREATE]: String,
        [EPermissionPropTypes.MODIFY]: String,
        [EPermissionPropTypes.DELETE]: String,
    },
    {
        _id: false,
    },
);

export const MembershipSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    [EPermissionTypes.USER]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.USER_PROFILE]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.USER_PAYMENT]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.POST]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.POST_COMMENT]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.COURSE]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.COURSE_DETAIL]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.COURSE_NOTE]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.COURSE_COMMENT]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.COURSE_VIDEO_LECTURE]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.SANDBOX]: {
        type: PermissionPropSchema,
    },
    [EPermissionTypes.CLIENT]: {
        type: PermissionPropSchema,
    },
});

export const Membership: Model<IMembershipModel> = model<IMembershipModel>(
    'Membership',
    MembershipSchema,
);
