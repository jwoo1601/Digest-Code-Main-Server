import validator from 'validator';

import { BaseRouter } from '../../../internals/router';
import { ERoutingMethod, IRouteEndpoint } from '../../../interfaces/router';
import { authenticate } from '../../../middlewares/authentication';
import {
    authorize,
    restrictPermission,
} from '../../../middlewares/authorization';
import {
    EPermissionTypes,
    EPermissionPropTypes,
    EPermission,
} from '../../../interfaces/permission';
import {
    handleErrorByLog,
    handleErrorByLogFetch,
} from '../../../middlewares/errorHandlers';
import {
    INFO_SUCCESSFUL_DELETION,
    CLIENT_ERROR_INVALID_QUERY_STRING,
    INFO_SUCCESSFUL_QUERY,
    CLIENT_ERROR_NO_MATCHING_RESULT,
    CLIENT_ERROR_INVALID_FIELD_INPUT,
    INFO_SUCCESSFUL_REGISTRATION,
    CLIENT_ERROR_DUPLICATE_IDENTIFIER,
    INFO_SUCCESSFUL_MODIFICATION,
    CLIENT_ERROR_INVALID_PARAMETER,
    SERVER_ERROR_GENERAL_OPERATION_FAILURE,
} from '../../../internals/response';
import { ICourse, ICourseChapter } from '../../../interfaces/course';
import { Course } from '../../../models/course';
import {
    CourseQueryValidator,
    CoursePostValidator,
    CourseEditValidator,
} from '../../../validators/course';
import { CourseChapterValidator } from '../../../validators/courseChapter';
import { IUserModel } from '../../../models/user';
import { IPost } from '../../../interfaces/post';
import { IResource } from '../../../interfaces/resource';
import { ValidationUtils } from '../../../validators/utils';
import { ICommentModel } from '../../../models/comment';

const mapNoteResource = (resource: IResource) => ({
    location: resource.namespace.location,
    type: resource.type,
    rid: resource.rid,
});

const mapNote = (note: IPost) => ({
    title: note.title,
    author: note.author,
    body: note.body,
    resources: note.resources.map(mapNoteResource),
});

const mapCourseChapter = (chapter: ICourseChapter) => ({
    title: chapter.title,
    summary: chapter.summary,
    notes: chapter.notes.map(mapNote),
    released: chapter.released,
});

const mapCourseComment = (comment: ICommentModel) => ({
    body: comment.body,
    commentedBy: comment.commentedBy.username,
    commentedAt: comment.commentedAt,
    lastModifiedAt: comment.lastModifiedAt,
})

const mapCourse = (unleash: boolean) => (course: ICourse) => ({
    code: course.code,
    name: course.name,
    description: course.description,
    chapters: unleash
        ? course.chapters.map(mapCourseChapter)
        : course.chapters
              .filter(chapter => chapter.released)
              .map(mapCourseChapter),
    languages: course.languages,
    comments: course.comments
});

/**
 * GET /api/v1/course
 * @query page: number
 * @query limit: number
 * @query name: string
 * @query detailed: boolean
 * @query unleash: boolean
 */
const getAllCourseInfo: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        page: 1,
        limit: 10,
        name: null,
        detailed: false,
    },
    handler: async function(req, res, logger) {
        const {
            valid,
            validated,
            errors,
        } = new CourseQueryValidator().validate(req.query, this.defaults);
        if (!valid) {
            this.logger.error(
                'Failed to retrieve course list: invalid query string',
                {
                    query: req.query,
                },
            );

            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    errors,
                },
            };
        }

        const { page, limit, name, detailed, unleash } = validated;
        let dbQuery = name ? Course.find({ name: name }) : Course.find();
        if (detailed) {
            dbQuery = dbQuery.select('+chapters +languages');
        }

        const foundCourses = await dbQuery
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ code: 'asc' })
            .exec();

        return {
            response: INFO_SUCCESSFUL_QUERY,
            data: {
                courses: foundCourses.map(mapCourse(unleash)),
            },
        };
    },
    errorHandler: handleErrorByLog('Failed to retrieve course list'),
};

/**
 * GET /api/v1/course/:code
 */
const getCourseInfoByCode: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/:code',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_DETAIL,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.LIMITED_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { code } = req.params;
        const foundCourse = await Course.findOne({ code });
        if (foundCourse) {
            const user = req.user as IUserModel;
            return {
                response: INFO_SUCCESSFUL_QUERY,
                data: {
                    course: mapCourse(
                        user.membership[EPermissionTypes.COURSE_DETAIL][
                            EPermissionPropTypes.VIEW
                        ] == EPermission.FULL_ACCESS,
                    ),
                },
            };
        } else {
            logger.error(
                `Failed to retrieve course info of Course {${code}}: no matching course found`,
                {
                    code,
                },
            );

            return {
                response: CLIENT_ERROR_NO_MATCHING_RESULT,
            };
        }
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to retrieve course info of Course {${req.params.code}]`,
    })),
};

/**
 * POST api/v1/course/add
 */
const addCourse: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/add',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE,
            prop: EPermissionPropTypes.CREATE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        code: null,
        name: null,
        description: null,
        languages: [],
    },
    handler: async function(req, res, logger) {
        const { valid, validated, errors } = new CoursePostValidator().validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(`Failed to add new course: invalid incoming data`, {
                errors,
            });

            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { code, name, description, languages } = validated;

        if (await Course.findOne({ code: validated.code })) {
            logger.error(`Failed to add new course: duplicate course code`, {
                code,
            });

            return {
                response: CLIENT_ERROR_DUPLICATE_IDENTIFIER,
            };
        }

        await Course.create({
            code,
            name,
            description,
            languages,
        });

        logger.info(
            `Successfully added new course: code=${code}, name=${name}`,
            {
                course: {
                    code,
                    name,
                    description,
                    languages,
                },
            },
        );

        return {
            response: INFO_SUCCESSFUL_REGISTRATION,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to add new Course named "${req.body.name}"`,
        meta: {
            input: req.body,
        },
    })),
};

/**
 * PUT /api/v1/course/edit
 * @query course: course code
 */
const editCourseByCode: IRouteEndpoint = {
    method: ERoutingMethod.PUT,
    route: '/edit',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE,
            prop: EPermissionPropTypes.MODIFY,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        name: null,
        description: null,
        languages: [],
    },
    handler: async function(req, res, logger) {
        const { course } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to edit Course {${course}}: no matching course found`,
            );

            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
            };
        }

        const validator = new CourseEditValidator();
        const { valid, validated, errors } = validator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to edit Course {${course}}: invalid incoming data`,
                {
                    errors,
                },
            );

            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { name, description, languages } = validated;
        await Course.updateOne(
            { code: course },
            {
                code: course,
                name,
                description,
                languages,
            },
        );
        return {
            response: INFO_SUCCESSFUL_MODIFICATION,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to modify course data of Course {${req.query.course}}`,
        meta: {
            input: req.body,
        },
    })),
};

/**
 * DELETE /api/v1/course/delete
 * @query code course code
 */
const deleteCourseByCode: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/delete',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { course } = req.query;
        if (!(await Course.findOne({ code: course }))) {
            logger.error(
                `Failed to delete Course {${course}}: no matching course found`,
            );

            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
            };
        }

        const { n } = await Course.deleteOne({
            code: course,
        });
        if (n === 1) {
            logger.info(`Successfully deleted Course {${course}}`);
            return {
                response: INFO_SUCCESSFUL_DELETION,
            };
        }

        logger.error(`Failed to delete Course {${course}}`);
        return {
            response: SERVER_ERROR_GENERAL_OPERATION_FAILURE,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to delete Course {${req.query.course}}`,
    })),
};

/**
 * GET /api/v1/course/chapter
 * @param chapterIndex index of the chapter
 * @query course: course code
 */
const getCourseChapterByIndex: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/chapter/:chapterIndex',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_DETAIL,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { chapterIndex } = req.params;
        const { course } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to retrieve Chapter {${chapterIndex}} of Course {${course}}: no matching course found`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    course,
                },
            };
        }

        let validatedChapterIndex = null;
        if (validator.isInt(chapterIndex)) {
            validatedChapterIndex = ValidationUtils.getNumber(chapterIndex);
        }

        if (
            validatedChapterIndex === null ||
            foundCourse.chapters.length <= validatedChapterIndex
        ) {
            logger.error(
                `Failed to retrieve Chapter {${chapterIndex}} of Course {${course}}: invalid chapter index`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    chapterIndex,
                },
            };
        }

        return {
            response: INFO_SUCCESSFUL_QUERY,
            data: {
                chapter: mapCourseChapter(
                    foundCourse.chapters[validatedChapterIndex],
                ),
            },
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to retrieve Chapter {${req.params.chapterIndex}} of Course {${req.query.course}}`,
    })),
};

/**
 * POST /api/v1/course/chapter/add
 * @query course: course code
 */
const addCourseChapter: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/chapter/add',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_DETAIL,
            prop: EPermissionPropTypes.CREATE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        title: null,
        summary: null,
        released: false,
    },
    handler: async function(req, res, logger) {
        const { course } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to add new chapter to Course {${course}}: no matching course found`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
            };
        }

        const validator = new CourseChapterValidator();
        const { valid, validated, errors } = validator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to add new chapter to Course {${course}}: invalid incoming data`,
                {
                    errors,
                },
            );
            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { title, summary, released } = validated;
        foundCourse.chapters.push({ title, summary, released });
        await foundCourse.save();

        logger.info(`Successfully added new chapter to Course {${course}}`);
        return {
            response: INFO_SUCCESSFUL_REGISTRATION,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to add new chapter to Course {${req.query.course}}`,
    })),
};

/**
 * PUT /api/v1/course/chapter/edit
 * @query course: course code
 * @query chapterIndex: index of the chapter to edit
 */
const editCourseChapterByIndex: IRouteEndpoint = {
    method: ERoutingMethod.PUT,
    route: '/chapter/edit',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_DETAIL,
            prop: EPermissionPropTypes.MODIFY,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        title: null,
        summary: null,
        released: false,
    },
    handler: async function(req, res, logger) {
        const { course, chapterIndex } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to update Chapter {${chapterIndex}} of Course {${course}}: no matching course found`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    course,
                },
            };
        }

        let validatedChapterIndex = null;
        if (validator.isInt(chapterIndex)) {
            validatedChapterIndex = ValidationUtils.getNumber(chapterIndex);
        }

        if (
            validatedChapterIndex === null ||
            foundCourse.chapters.length <= validatedChapterIndex
        ) {
            logger.error(
                `Failed to update Chapter {${chapterIndex}} of Course {${course}}: invalid chapter index`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    chapterIndex,
                },
            };
        }

        const chapterValidator = new CourseChapterValidator();
        const { valid, validated, errors } = chapterValidator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to update Chapter {${chapterIndex}} of Course {${course}}: invalid incoming data`,
                {
                    errors,
                },
            );
            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { title, summary, released } = validated;
        foundCourse.chapters[validatedChapterIndex] = {
            ...foundCourse.chapters[validatedChapterIndex],
            title,
            summary,
            released,
        };
        await foundCourse.save();

        logger.info(
            `Successfully updated Chapter {${chapterIndex}} of Course {${course}}`,
        );
        return {
            response: INFO_SUCCESSFUL_MODIFICATION,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to update Chapter {${req.query.chapterIndex}} of Course {${req.query.course}}`,
    })),
};

/**
 * DELETE /api/v1/course/chapter/delete
 * @query course: course code
 * @query chapterIndex: index of the chapter to delete
 */
const deleteCourseChapterByIndex: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/chapter/delete',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { course, chapterIndex } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to delete Chapter {${chapterIndex}} of Course {${course}}: no matching course found`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    course,
                },
            };
        }

        let validatedChapterIndex = null;
        if (validator.isInt(chapterIndex)) {
            validatedChapterIndex = ValidationUtils.getNumber(chapterIndex);
        }

        if (
            validatedChapterIndex === null ||
            foundCourse.chapters.length <= validatedChapterIndex
        ) {
            logger.error(
                `Failed to delete Chapter {${chapterIndex}} of Course {${course}}: invalid chapter index`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    chapterIndex,
                },
            };
        }

        foundCourse.chapters.splice(validatedChapterIndex, 1);
        await foundCourse.save();

        logger.info(
            `Successfully deleted Chapter {${chapterIndex}} of Course {${course}}`,
        );
        return {
            response: INFO_SUCCESSFUL_DELETION,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to delete Chapter {${req.query.chapterIndex}} of Course {${req.query.course}}`,
    })),
};

/**
 * GET /api/v1/course/comment
 * @param commentId id of the comment to retrieve
 * @query course: course code
 */
const getCourseCommentById: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/comment/:commentId',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_COMMENT,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { commentId } = req.params;
        const { course } = req.query;
        const foundCourse = await Course.findOne({ code: course });
        if (!foundCourse) {
            logger.error(
                `Failed to retrieve Comment {${commentId}} of Course {${course}}: no matching course found`,
            );
            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    course,
                },
            };
        }

        const foundComment = foundCourse.comments.find((comment: ICommentModel) => comment.id === commentId);
        if (!foundComment) {
            logger.error(`Failed to retrieve Comment {${commentId}} of Course {${course}}: no matching comment found`);
            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
                data: {
                    commentId
                }
            };
        }

        

    },
    errorHandler:
};

/**
 * POST /api/v1/course/comment/add
 * @query course: course code
 */
const addCourseComment: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/comment/add',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_COMMENT,
            prop: EPermissionPropTypes.CREATE,
            value: EPermission.FULL_ACCESS
        })
    ],
    handler: async function(req, res, logger) {

    },
    errorHandler: 
}

/**
 * PUT /api/v1/course/comment/edit
 * @query course: course code
 * @query commentId: id of the comment to edit
 */
const editCourseCommentById: IRouteEndpoint = {
    method: ERoutingMethod.PUT,
    route: '/comment/edit',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_COMMENT,
            prop: EPermissionPropTypes.MODIFY,
            value: EPermission.FULL_ACCESS
        })
    ],
    handler: async function(req, res, logger) {

    },
    errorHandler: 
}

/**
 * DELETE /api/v1/course/comment/delete
 * @query course: course code
 * @query commentId: id of the comment to delete
 */
const deleteCourseCommentById: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/comment/delete',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.COURSE_COMMENT,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS
        })
    ],
    handler: async function(req, res, logger) {

    },
    errorHandler: 
}

export class CourseRouter extends BaseRouter {
    constructor() {
        super(
            'course',
            [
                // Course Routes
                getAllCourseInfo,
                getCourseInfoByCode,
                addCourse,
                editCourseByCode,
                deleteCourseByCode,

                // Course Chapter Routes
                getCourseChapterByIndex,
                addCourseChapter,
                editCourseChapterByIndex,
                deleteCourseChapterByIndex,

                // Course Comment Routes
                getCourseCommentById,
                addCourseComment,
                editCourseCommentById,
                deleteCourseCommentById,
            ],
            [],
        );
    }
}
