import mime from 'mime-types';
import path from 'path';

import { BaseRouter } from '../../internals/router';
import { IRouteEndpoint, ERoutingMethod } from '../../interfaces/router';
import { Storage } from '../../storage';
import {
    CLIENT_ERROR_NO_SUCH_RESOURCE,
    CLIENT_ERROR_INVALID_QUERY_STRING,
} from '../../internals/response';
import { EResourceNamespaceLocation } from '../../interfaces/resource';
import {
    ResourceNameQueryValidator,
    ResourceRIDQueryValidator,
} from '../../validators/resource';

/**
 * GET /cdn/resource/name/:name
 * @query location: EResourceNamespaceLocation
 * @query type: EResourceType
 * @query category: string
 * @query inline: boolean
 */
const getResourceByName: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/name/:name',
    middlewares: [],
    defaults: {
        location: EResourceNamespaceLocation.REMOTE_AZURE,
        type: null,
        name: null,
        category: null,
        inline: false,
    },
    handler: async function(req, res, logger) {
        const { name } = req.params;
        const { location, type, category, inline } = req.query;

        const {
            valid,
            validated,
            errors,
        } = new ResourceNameQueryValidator().validate(
            { location, type, name, category, inline },
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to retrieve Resource {type=${type}, name=${name}, category=${category}} from Storage {${location}}`,
            );

            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    errors,
                },
            };
        }

        if (
            !(await Storage.has(
                validated.location,
                validated.type,
                validated.name,
                validated.category,
            ))
        ) {
            return {
                response: CLIENT_ERROR_NO_SUCH_RESOURCE,
            };
        }

        const resourceInstance = await Storage.get(
            validated.location,
            validated.type,
            validated.name,
            validated.category,
        );
        const buffer = await resourceInstance.toBuffer();

        res.status(200)
            .header(
                'Content-Disposition',
                validated.inline
                    ? 'inline'
                    : `attachment; filename="${validated.name}"`,
            )
            .header('Content-Length', buffer.byteLength.toString(10));

        const mimeType = mime.contentType(validated.name);
        if (mimeType) {
            res.contentType(mimeType as string);
        }

        res.send(buffer);

        return null;
    },
};

/**
 * GET /cdn/resource/rid/:rid
 * @query location: EResourceNamespaceLocation
 * @query type: EResourceType
 * @query inline: boolean
 */
const getResourceByRID: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/rid/:rid',
    middlewares: [],
    defaults: {
        location: null,
        type: null,
        rid: null,
        inline: false,
    },
    handler: async function(req, res, logger) {
        const { rid } = req.params;
        const { location, type, inline } = req.query;

        const {
            valid,
            validated,
            errors,
        } = new ResourceRIDQueryValidator().validate(
            { location, type, rid, inline },
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to retrieve Resource {type=${type}, rid=${rid}} from Storage {${location}}`,
            );

            return {
                response: CLIENT_ERROR_INVALID_QUERY_STRING,
                data: {
                    errors,
                },
            };
        }

        let resourceInstance;
        if (validated.location) {
            if (
                !(await Storage.exists(
                    validated.location,
                    validated.type,
                    validated.rid,
                ))
            ) {
                return {
                    response: CLIENT_ERROR_NO_SUCH_RESOURCE,
                };
            }

            resourceInstance = await Storage.retrieve(
                validated.location,
                validated.type,
                validated.rid,
            );
        } else {
            if (!(await Storage.existsInAny(validated.type, rid))) {
                return {
                    response: CLIENT_ERROR_NO_SUCH_RESOURCE,
                };
            }

            resourceInstance = (
                await Storage.retrieveAll(validated.type, validated.rid)
            ).PrimaryResource;
        }

        const buffer = await resourceInstance.toBuffer();
        const resource = resourceInstance.getResource();
        const resourceFilename = `${resource.sourceName}${path.extname(
            resource.sourceName,
        )}`;

        res.status(200)
            .header(
                'Content-Disposition',
                validated.inline
                    ? 'inline'
                    : `attachment; filename="${resourceFilename}"`,
            )
            .header('Content-Length', buffer.byteLength.toString(10));

        const mimeType = mime.contentType(resourceFilename);
        if (mimeType) {
            res.contentType(mimeType as string);
        }

        res.send(buffer);

        return null;
    },
};

export class ResourceRouter extends BaseRouter {
    constructor() {
        super('resource', [getResourceByName, getResourceByRID], []);
    }
}
