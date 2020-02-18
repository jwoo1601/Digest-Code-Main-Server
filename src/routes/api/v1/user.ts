import { IRouteEndpoint, ERoutingMethod } from '../../../interfaces/router';
import { BaseRouter } from '../../../internals/router';
import { User, createUser } from '../../../models/user';
import { Membership } from '../../../models/membership';
import { UserRegisterValidator } from '../../../validators/user';
import {
    ensureLoggedOut,
    authenticate,
} from '../../../middlewares/authentication';
import { endResponse } from '../../../middlewares/response';
import {
    handleErrorByLog,
    handleErrorByLogFetch,
} from '../../../middlewares/errorHandlers';
import {
    CLIENT_ERROR_INVALID_FIELD_INPUT,
    CLIENT_ERROR_DUPLICATE_USERNAME,
    CLIENT_ERROR_USER_ALREADY_AUTHENTICATED,
    SERVER_ERROR_GENERAL_OPERATION_FAILURE,
    INFO_SUCCESSFUL_REGISTRATION,
    INFO_SUCCESSFUL_QUERY,
    CLIENT_ERROR_INVALID_PARAMETER,
    INFO_SUCCESSFUL_DELETION,
    CLIENT_ERROR_INVALID_QUERY_STRING,
} from '../../../internals/response';
import {
    authorize,
    restrictPermission,
} from '../../../middlewares/authorization';
import {
    EPermissionTypes,
    EPermissionPropTypes,
    EPermission,
} from '../../../interfaces/permission';
import { ValidationUtils } from '../../../validators/utils';
import { IUser } from '../../../interfaces/user';
import { IEnrolledCourse, ICourse } from '../../../interfaces/course';
import { IResource } from '../../../interfaces/resource';

const userDetailedFields = [
    'phoneNumber',
    'primaryContact',
    'secondaryContact',
    'location',
    'enrolledCourses',
    'favoriteCourses',
    'preferredLanguage',
    'profileImage',
];

const mapEnrolledCourse = (enrolled: IEnrolledCourse) => ({
    code: enrolled.course.code,
    enrolledAt: enrolled.enrolledAt,
    completed: enrolled.completed,
    completedAt: enrolled.completedAt,
});

const mapFavoriteCourse = (favorite: ICourse) => ({
    code: favorite.code,
});

const mapProfileImage = (image: IResource) => ({
    location: image.namespace.location,
    type: image.type,
    rid: image.rid,
});

const mapUser = (user: IUser) => ({
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    primaryContact: user.primaryContact,
    secondaryContact: user.secondaryContact,
    membership: user.membership.name,
    location: user.location,
    registeredAt: user.registeredAt,
    enrolledCourses: user.enrolledCourses.map(mapEnrolledCourse),
    favoriteCourses: user.favoriteCourses.map(mapFavoriteCourse),
    preferredLanguage: user.preferredLanguage,
    profileImage: user.profileImage && mapProfileImage(user.profileImage),
});

/**
 * GET /api/v1/user/profile
 * @query detailed: boolean
 */
const getUserProfiles: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/profile',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.USER,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { detailed } = req.query;
        if (
            ValidationUtils.isDefined(detailed) &&
            !ValidationUtils.isBoolean(detailed)
        ) {
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
            };
        }

        let dbQuery = User.find();
        const detailedQuery = ValidationUtils.getBoolean(detailed);
        if (detailedQuery) {
            dbQuery = dbQuery.select(
                userDetailedFields.map(f => `+${f}`).join(' '),
            );
        }

        const allUsers = await dbQuery.exec();
        return {
            response: INFO_SUCCESSFUL_QUERY,
            data: {
                users: allUsers.map(mapUser),
            },
        };
    },
    errorHandler: handleErrorByLog('Failed to retrieve user profiles'),
};

/**
 * GET /api/v1/user/profile/:username
 */
const getUserProfileByUsername: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/:username',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.USER,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { username } = req.params;

        if (!(username && ValidationUtils.isUsername(username))) {
            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
            };
        }

        const foundUser = await User.findOne({ username }).select('');
        return {
            response: INFO_SUCCESSFUL_QUERY,
            data: {
                user: mapUser(foundUser),
            },
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to retreive user profile of User {${req.params.username}}`,
    })),
};

/**
 * POST /api/v1/user/register
 */
const registerUser: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/register',
    middlewares: [
        ensureLoggedOut(endResponse(CLIENT_ERROR_USER_ALREADY_AUTHENTICATED)),
    ],
    defaults: {
        username: null,
        password: null,
        passwordConfirm: null,
        email: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        birthDate: null,
    },
    handler: async function(req, res, logger) {
        const validator = new UserRegisterValidator();
        const { valid, validated, errors } = validator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to register new user data: invalid input data`,
                {
                    errors,
                },
            );
            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const {
            username,
            password,
            email,
            firstName,
            lastName,
            phoneNumber,
            birthDate,
        } = validated;

        const foundUser = await User.findOne({ username });
        if (foundUser) {
            return {
                response: CLIENT_ERROR_DUPLICATE_USERNAME,
            };
        }

        const defaultMembership = await Membership.findOne({ name: 'none' });
        if (!defaultMembership) {
            logger.error(
                `Failed to register new user data of User {${username}}: no default membership found`,
            );
            return {
                response: SERVER_ERROR_GENERAL_OPERATION_FAILURE,
            };
        }

        await User.create(
            createUser({
                username,
                password,
                email,
                firstName,
                lastName,
                phoneNumber,
                birthDate,
                membership: defaultMembership,
            }),
        );

        this.logger.info(`Registered new user data of User {${username}}`);

        return {
            response: INFO_SUCCESSFUL_REGISTRATION,
        };
    },
    errorHandler: handleErrorByLog('Failed to register new user data'),
};

/**
 * DELETE /api/v1/user/unregister/:username
 */
const unregisterUserByUsername: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/unregister/:username',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.USER,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { username } = req.params;
        if (!(await User.findOne({ username }))) {
            logger.error(
                `Failed to unregister User {${username}}: no matching user found`,
            );

            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
            };
        }

        const { n } = await User.deleteOne({ username });
        if (n === 1) {
            logger.info(`Successfully unregistered User {${username}}`);

            return {
                response: INFO_SUCCESSFUL_DELETION,
            };
        }

        logger.error(`Failed to unregister User {${username}}`);

        return {
            response: SERVER_ERROR_GENERAL_OPERATION_FAILURE,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to unregister User {${req.params.username}}`,
    })),
};

/**
 * /api/v1/user
 */
export class UserRouter extends BaseRouter {
    constructor() {
        super(
            'user',
            [
                getUserProfiles,
                getUserProfileByUsername,
                registerUser,
                unregisterUserByUsername,
            ],
            [],
        );
    }
}
