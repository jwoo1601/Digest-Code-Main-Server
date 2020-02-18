import { ReadStream } from 'fs';
import {
    EResourceType,
    IResource,
    IResourceNamespace,
} from '../interfaces/resource';
import {
    IResourceStorage,
    IResourceInstance,
    IResourceNamespaceInstance,
} from '../interfaces/resourceStorage';
import winston from 'winston';

export class NullResourceInstance implements IResourceInstance {
    getResource(): IResource {
        return null;
    }

    async fromFile(filename: string): Promise<NullResourceInstance> {
        return this;
    }

    async fromStream(
        stream: ReadStream,
        bufferSize?: number,
        concurrency?: number,
    ): Promise<NullResourceInstance> {
        return this;
    }

    async toFile(filename?: string): Promise<NullResourceInstance> {
        return this;
    }

    async toBuffer(): Promise<Buffer> {
        return null;
    }

    async hasBinding(): Promise<boolean> {
        return false;
    }

    async removeBinding(): Promise<NullResourceInstance> {
        return this;
    }
}

export class NullResourceNamespaceInstance
    implements IResourceNamespaceInstance {
    getNamespace(): IResourceNamespace {
        return null;
    }

    async hasResourceMapping(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        return false;
    }

    async hasResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        return false;
    }

    async getOrCreateResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceInstance> {
        return new NullResourceInstance();
    }

    async removeResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceNamespaceInstance> {
        return this;
    }

    async getAllResources(): Promise<IResourceInstance[]> {
        return [];
    }
}

export class NullResourceStorage implements IResourceStorage {
    async hasNamespaceMapping(name: string): Promise<boolean> {
        return false;
    }

    async hasNamespaceInstance(name: string): Promise<boolean> {
        return false;
    }

    async hasNamespace(name: string): Promise<boolean> {
        return false;
    }

    async getOrCreateNamespace(
        name: string,
        label?: string,
    ): Promise<IResourceNamespaceInstance> {
        return new NullResourceNamespaceInstance();
    }

    async forceDeleteNamespace(name: string): Promise<void> {
        // NO-OP
    }

    async deleteNamespaceIfEmpty(name: string): Promise<void> {
        // NO-OP
    }

    async isNamespaceEmpty(name: string): Promise<boolean> {
        return true;
    }

    async getAllNamespaces(): Promise<IResourceNamespaceInstance[]> {
        return [];
    }
}
