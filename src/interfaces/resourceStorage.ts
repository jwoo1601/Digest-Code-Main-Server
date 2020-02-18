import { ReadStream } from 'fs';
import { IResource, IResourceNamespace, EResourceType } from './resource';

/**
 * @nothrow
 */
export interface IResourceInstance {
    getResource(): IResource;

    fromFile(filename: string): Promise<any>;
    fromStream(
        stream: ReadStream,
        bufferSize?: number,
        concurrency?: number,
    ): Promise<any>;

    toFile(filename?: string): Promise<any>;
    toBuffer(): Promise<Buffer>;

    hasBinding(): Promise<boolean>;
    removeBinding(): Promise<any>;
}

/**
 *
 * @nothrow
 */
export interface IResourceNamespaceInstance {
    getNamespace(): IResourceNamespace;

    mappingExists(type: EResourceType, rid: string): Promise<boolean>;

    hasResourceMapping(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean>;

    resourceExists(type: EResourceType, rid: string): Promise<boolean>;

    hasResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean>;

    getResource(type: EResourceType, rid: string): Promise<IResourceInstance>;

    getOrCreateResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceInstance>;

    removeResourceFromRID(
        type: EResourceType,
        rid: string,
    ): Promise<IResourceNamespaceInstance>;

    removeResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceNamespaceInstance>;

    getAllResources(): Promise<IResourceInstance[]>;
}

/**
 *
 * @nothrow
 */
export interface IResourceStorage {
    hasNamespaceMapping(name: string): Promise<boolean>;
    hasNamespaceInstance(name: string): Promise<boolean>;
    hasNamespace(name: string): Promise<boolean>;

    getOrCreateNamespace(
        name: string,
        label?: string,
    ): Promise<IResourceNamespaceInstance>;

    forceDeleteNamespace(name: string): Promise<void>;
    deleteNamespaceIfEmpty(name: string): Promise<void>;

    isNamespaceEmpty(name: string): Promise<boolean>;

    getAllNamespaces(): Promise<IResourceNamespaceInstance[]>;
}
