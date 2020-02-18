import { IUser } from './user';
import { IResourceNamespace, IResource } from './resource';

export const enum ESandboxEnvironment {
    NODE = 'node',
    NODE_EXPRESS = 'node-express',
    JAVA = 'java',
    JAVA_SPRING_BOOT = 'java-spring-boot',
    RESTAPI = 'rest-api',
    SIMPLE = 'simple',
}

export const enum ESandboxPrivacyPolicy {
    PRIVATE = 'private',
    PROTECTED = 'protected',
    PUBLIC = 'public',
}

export interface ISandboxPackage {
    entryPoint: IResource;
}

export interface ISandbox {
    name: string;
    owner: IUser;
    environment: ESandboxEnvironment;
    isolated: boolean;
    privacyPolicy: ESandboxPrivacyPolicy;
    storage: IResourceNamespace;
    packages?: ISandboxPackage[];
    allowedUsers?: IUser[];
}
