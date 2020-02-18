export enum EResourceType {
    IMAGE = 'image',
    VIDEO = 'video',
    RUNNABLE = 'runnable',
}

export enum EResourceNamespaceLocation {
    LOCAL = 'local',
    REMOTE_AZURE = 'remote-azure',
    REMOTE_EXTERNAL = 'remote-external',
}

export interface IResourceNamespace {
    readonly name: string;
    readonly uuid: string;
    readonly location: EResourceNamespaceLocation;
}

/**
 * An interface descibing a resource object
 * @member type type of the resource
 * @member namespace namespace in which the resource object is stored
 * @member rid a unique resource identifier
 * @member category category of the resource (prefix)
 * @member sourceName the original name of the resource
 */
export interface IResource {
    readonly type: EResourceType;
    readonly namespace: IResourceNamespace;
    readonly rid: string;
    readonly category: string;
    readonly sourceName: string;
}
