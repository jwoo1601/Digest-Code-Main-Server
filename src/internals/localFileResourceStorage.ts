import { ReadStream, writeFile, copyFile, createWriteStream } from 'fs';
import { parse, ParsedPath, format } from 'path';
import { IResource } from '../interfaces/resource';
import {
    IResourceStorage,
    IResourceInstance,
    IResourceNamespaceInstance,
} from '../interfaces/resourceStorage';
import winston from 'winston';

/*
 * !!NOT IMPLENETED!!
 */

export class LocalFileResourceInstance implements IResourceInstance {
    private resource: IResource;
    private resourcePath: ParsedPath;

    constructor(resource: IResource, path: string) {
        this.resource = resource;
        this.resourcePath = parse(path);
    }

    getResource(): IResource {
        return this.resource;
    }

    async fromFile(filename: string): Promise<LocalFileResourceInstance> {
        try {
            copyFile(filename, format(this.resourcePath), () => {});
        } catch (err) {}

        return this;
    }

    async fromStream(
        stream: ReadStream,
        bufferSize?: number,
        concurrency?: number,
    ): Promise<LocalFileResourceInstance> {
        try {
            stream.pipe(createWriteStream(format(this.resourcePath), {}));
        } catch (err) {}
        return this;
    }

    async toFile(filename?: string): Promise<LocalFileResourceInstance> {
        return this;
    }

    async toBuffer(): Promise<Buffer> {
        return null;
    }

    async hasBinding(): Promise<boolean> {
        return false;
    }

    async removeBinding(): Promise<LocalFileResourceInstance> {
        return this;
    }
}

export class LocalFileResourceStorage implements IResourceStorage {
    private logger: winston.Logger;
    readonly storagePath: ParsedPath;

    constructor(storagePath: string) {
        try {
            this.storagePath = parse(storagePath);
        } catch (err) {}
    }

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
        return null;
    }

    async forceDeleteNamespace(name: string): Promise<void> {}

    async deleteNamespaceIfEmpty(name: string): Promise<void> {}

    async isNamespaceEmpty(name: string): Promise<boolean> {
        return true;
    }

    async getAllNamespaces(): Promise<IResourceNamespaceInstance[]> {
        return [];
    }
}
