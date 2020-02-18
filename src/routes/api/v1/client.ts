import uuid from 'uuid';
import moment from 'moment';

import { BaseRouter } from '../../../internals/router';
import { ERoutingMethod, IRouteEndpoint } from '../../../interfaces/router';
import { Client, IClientModel } from '../../../models/client';
import { ClientRegistrationValidator } from '../../../validators/client';
import { authenticate } from '../../../middlewares/authentication';
import {
    EPermissionTypes,
    EPermission,
    EPermissionPropTypes,
} from '../../../interfaces/permission';
import {
    restrictPermission,
    authorize,
} from '../../../middlewares/authorization';
import {
    INFO_SUCCESSFUL_QUERY,
    CLIENT_ERROR_NO_MATCHING_RESULT,
    INFO_SUCCESSFUL_DELETION,
    CLIENT_ERROR_INVALID_PARAMETER,
    CLIENT_ERROR_INVALID_FIELD_INPUT,
    CLIENT_ERROR_DUPLICATE_IDENTIFIER,
    INFO_SUCCESSFUL_CLIENT_REGISTRATION,
    SERVER_ERROR_GENERAL_OPERATION_FAILURE,
} from '../../../internals/response';
import {
    handleErrorByLog,
    handleErrorByLogFetch,
} from '../../../middlewares/errorHandlers';

const mapClient = (client: IClientModel) => ({
    id: client.id,
    name: client.name,
    description: client.description,
    registeredAt: client.registeredAt,
    expiryDate: client.expiryDate,
});

/**
 * GET /api/v1/client/profile
 * @query detailed: boolean
 * @response clients
 */
const getClientProfiles: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/profile',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.CLIENT,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, next) {
        const allClients = await Client.find();
        return {
            response: INFO_SUCCESSFUL_QUERY,
            data: {
                clients: allClients.map(mapClient),
            },
        };
    },
    errorHandler: handleErrorByLog('Failed to retrieve client profiles'),
};

/**
 * GET /api/v1/client/profile/:clientId
 * @param clientId
 * @response client
 */
const getClientProfileById: IRouteEndpoint = {
    method: ERoutingMethod.GET,
    route: '/profile/:clientId',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.CLIENT,
            prop: EPermissionPropTypes.VIEW,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { clientId } = req.params;

        const foundClient = await Client.findById(clientId);
        if (foundClient) {
            return {
                response: INFO_SUCCESSFUL_QUERY,
                data: {
                    client: mapClient(foundClient),
                },
            };
        } else {
            return {
                response: CLIENT_ERROR_NO_MATCHING_RESULT,
            };
        }
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to retreive client profile of Client {${req.params.clientId}}`,
    })),
};

/**
 * POST /api/v1/client/register
 * @response client_id
 * @response expiry_date
 * @error_response errors
 */
const registerClient: IRouteEndpoint = {
    method: ERoutingMethod.POST,
    route: '/register',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.CLIENT,
            prop: EPermissionPropTypes.CREATE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    defaults: {
        name: null,
        description: '',
    },
    handler: async function(req, res, logger) {
        const validator = new ClientRegistrationValidator();
        const { valid, validated, errors } = validator.validate(
            req.body,
            this.defaults,
        );
        if (!valid) {
            logger.error(
                `Failed to register new client data: invalid incoming data`,
                {
                    errors,
                },
            );
            return {
                response: CLIENT_ERROR_INVALID_FIELD_INPUT,
                data: { errors },
            };
        }

        const { name, description } = validated;
        const foundClient = await Client.findOne({
            name,
        });
        if (foundClient) {
            return { response: CLIENT_ERROR_DUPLICATE_IDENTIFIER };
        }
        const newClient = await Client.create({
            name,
            secret: uuid.v4(),
            expiryDate: moment()
                .add(6, 'months')
                .toDate(),
            description,
        });

        return {
            response: INFO_SUCCESSFUL_CLIENT_REGISTRATION,
            data: {
                clientId: newClient.id,
                apiKey: newClient.secret,
            },
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: 'Failed to register new client data',
        meta: {
            input: req.body,
        },
    })),
};

const deleteClientById: IRouteEndpoint = {
    method: ERoutingMethod.DELETE,
    route: '/delete/:clientId',
    middlewares: [
        authenticate(),
        authorize(),
        restrictPermission({
            type: EPermissionTypes.CLIENT,
            prop: EPermissionPropTypes.DELETE,
            value: EPermission.FULL_ACCESS,
        }),
    ],
    handler: async function(req, res, logger) {
        const { clientId } = req.params;
        if (!(await Client.findById(clientId))) {
            logger.error(
                `Failed to delete Client {${clientId}}: no matching client found`,
            );

            return {
                response: CLIENT_ERROR_INVALID_PARAMETER,
            };
        }

        const { n } = await Client.deleteOne({ id: clientId });
        if (n === 1) {
            logger.info(`Successfully deleted Client {${clientId}}`);
            return {
                response: INFO_SUCCESSFUL_DELETION,
            };
        }

        logger.error(`Failed to delete Client {${clientId}}`);
        return {
            response: SERVER_ERROR_GENERAL_OPERATION_FAILURE,
        };
    },
    errorHandler: handleErrorByLogFetch((req, res) => ({
        message: `Failed to delete Client {${req.params.clientId}}`,
    })),
};

/**
 * /api/v1/client
 */
export class ClientRouter extends BaseRouter {
    constructor() {
        super(
            'client',
            [
                getClientProfiles,
                getClientProfileById,
                registerClient,
                deleteClientById,
            ],
            [],
        );
    }
}
