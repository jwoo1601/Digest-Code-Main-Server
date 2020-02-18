import { RequestHandler } from 'express';
import { OAuth2AuthorizedRequest } from './oauth2';
import { EPermissionTypes } from '../interfaces/permission';
import { OAuth2Service } from '../internals/auth.oauth2';
import moment from 'moment';
import { OAuth2Router } from '../routes/api/v1/oauth2';

const permissionIcons = {
    [EPermissionTypes.USER]: 'supervisor_account',
    [EPermissionTypes.USER_PROFILE]: 'account_circle',
    [EPermissionTypes.USER_PAYMENT]: 'payment',

    [EPermissionTypes.POST]: 'insert_drive_file',
    [EPermissionTypes.POST_COMMENT]: 'comment',

    [EPermissionTypes.COURSE]: 'storage',
    [EPermissionTypes.COURSE_DETAIL]: 'pageview',
    [EPermissionTypes.COURSE_NOTE]: 'import_contacts',
    [EPermissionTypes.COURSE_COMMENT]: 'mode_comment',
    [EPermissionTypes.COURSE_VIDEO_LECTURE]: 'movie',

    [EPermissionTypes.SANDBOX]: 'cloud',

    [EPermissionTypes.CLIENT]: 'build',
};

export function openOAuth2Dialog(): RequestHandler {
    return (req, res, next) => {
        const oauth2Req = req as OAuth2AuthorizedRequest;
        if (oauth2Req.oauth2 && oauth2Req.oauth2.locals) {
            const { transactionID, redirectURI } = oauth2Req.oauth2;
            const { client, user, scope } = oauth2Req.oauth2.locals;
            const permissions = OAuth2Service.convertScopeToPermissions(scope);
            const parsedPermissions = Object.entries(EPermissionTypes).map(
                ([k, v]) => ({
                    icon: permissionIcons[v],
                    name: v
                        .split('/-')
                        .map(name => name[0].toUpperCase() + name.substr(0))
                        .join(' '),
                    ...permissions
                        .filter(p => p.type == v)
                        .map(p => ({ [p.prop]: p.value })),
                }),
            );

            res.render('dialog/oauth2', {
                clientName: client.name,
                username: user.username,
                numPermissions: parsedPermissions.length,
                permissions: parsedPermissions,
                redirectURI,
                thirdParty: true,
                elapsedTime: moment(client.registeredAt).fromNow(),
                requestURI: OAuth2Router.formatRoute(
                    `/decision?transaction_id=${transactionID}`,
                ),
                requestData: JSON.stringify({}),
            });
        }

        next();
    };
}

export function openLoginDialog(): RequestHandler {
    return (req, res, next) => {
        next();
    };
}
