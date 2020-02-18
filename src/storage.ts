import winston, { Logger } from 'winston';
import { ReadStream } from 'fs';

import {
    EResourceNamespaceLocation,
    EResourceType,
} from './interfaces/resource';
import {
    IResourceStorage,
    IResourceInstance,
} from './interfaces/resourceStorage';
import { AzureBlobResourceStorage } from './internals/azureBlobResourceStorage';
import { LocalFileResourceStorage } from './internals/localFileResourceStorage';
import { NullResourceStorage } from './internals/nullResourceStorage';
import { storage } from './credentials';

class NamespaceSetup {
    readonly name: string;
    readonly qualifiedName: string;
    readonly resourceType: EResourceType;
    readonly locations: EResourceNamespaceLocation[];

    constructor(
        name: string,
        resourceType: EResourceType,
        locations: EResourceNamespaceLocation[],
    ) {
        this.name = name;
        this.qualifiedName = `digest-code-${name}`;
        this.resourceType = resourceType;
        this.locations = locations;
    }
}

const enum EDefaultNamespaceType {
    IMAGES = 'images',
    VIDEOS = 'videos',
    SANDBOX = 'sandbox',
}

const defaultNamespaces: NamespaceSetup[] = [
    new NamespaceSetup(EDefaultNamespaceType.IMAGES, EResourceType.IMAGE, [
        EResourceNamespaceLocation.REMOTE_AZURE,
    ]),
    new NamespaceSetup(EDefaultNamespaceType.VIDEOS, EResourceType.VIDEO, [
        EResourceNamespaceLocation.REMOTE_AZURE,
    ]),
    new NamespaceSetup(EDefaultNamespaceType.SANDBOX, EResourceType.RUNNABLE, [
        EResourceNamespaceLocation.LOCAL,
        EResourceNamespaceLocation.REMOTE_AZURE,
    ]),
];

export interface IStorageInitOptions {
    local?: boolean;
    azure?: boolean;
    external?: boolean;
}

export class Storage {
    private static instances: {
        [EResourceNamespaceLocation.LOCAL]: IResourceStorage;
        [EResourceNamespaceLocation.REMOTE_EXTERNAL]: IResourceStorage;
        [EResourceNamespaceLocation.REMOTE_AZURE]: IResourceStorage;
    };
    private static setupList: NamespaceSetup[];
    private static logger: Logger;

    static getSetupList(): NamespaceSetup[] {
        return this.setupList;
    }

    static getLocationsFromType(
        type: EResourceType,
    ): EResourceNamespaceLocation[] {
        const match = this.setupList.find(setup => setup.resourceType === type);
        if (match) {
            return match.locations;
        }

        return null;
    }

    static init(options?: IStorageInitOptions) {
        this.logger = winston.loggers.get('storage');

        const initOptions = options || {
            local: false,
            azure: true,
            external: false,
        };
        this.logger.verbose(`Storage default init options: ${initOptions}`, {
            options: initOptions,
        });

        if (initOptions.local) {
            const { storagePath } = storage.local;
            this.instances[
                EResourceNamespaceLocation.LOCAL
            ] = new LocalFileResourceStorage(storagePath);
        } else {
            this.instances[
                EResourceNamespaceLocation.LOCAL
            ] = new NullResourceStorage();
        }

        // if (initOptions.external) {
        // const { hostname, accessKey } = storage.remote;
        // this.instances[EResourceNamespaceLocation.REMOTE] = new RemoteFileResourceStorage(hostname, accessKey);
        // } else {
        this.instances[
            EResourceNamespaceLocation.REMOTE_EXTERNAL
        ] = new NullResourceStorage();
        // }

        if (initOptions.azure) {
            const { accountName, primaryAccessKey } = storage['azure-blob'];
            this.instances[
                EResourceNamespaceLocation.REMOTE_AZURE
            ] = new AzureBlobResourceStorage(accountName, primaryAccessKey);
        } else {
            this.instances[
                EResourceNamespaceLocation.REMOTE_AZURE
            ] = new NullResourceStorage();
        }

        Object.entries(this.instances).forEach(entry => {
            const location = entry[0];
            const storage = entry[1];

            defaultNamespaces
                .filter(
                    setup =>
                        setup.locations.findIndex(l => l == location) != -1,
                )
                .forEach(async setup => {
                    await storage.getOrCreateNamespace(
                        setup.qualifiedName,
                        setup.name,
                    );
                });
        });
    }

    static async exists(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        rid: string,
    ): Promise<boolean> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);
            return namespace.resourceExists(type, rid);
        }

        return false;
    }

    static async has(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            if (matchedSetup.locations.includes(location)) {
                const namespace = await this.instances[
                    location
                ].getOrCreateNamespace(matchedSetup.qualifiedName);
                return namespace.hasResource(type, name, category);
            }
        }

        return false;
    }

    static async existsInAny(
        type: EResourceType,
        rid: string,
    ): Promise<boolean> {
        return (
            Object.keys(this.instances).find(location =>
                this.exists(location as EResourceNamespaceLocation, type, rid),
            ) !== undefined
        );
    }

    static async hasInAny(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        return (
            Object.keys(this.instances).find(location =>
                this.has(
                    location as EResourceNamespaceLocation,
                    type,
                    name,
                    category,
                ),
            ) !== undefined
        );
    }

    static async get(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceInstance> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);

            if (await namespace.hasResource(type, name, category)) {
                return namespace.getOrCreateResource(type, name, category);
            }
        }

        return null;
    }

    static async retrieve(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        rid: string,
    ): Promise<IResourceInstance> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);

            if (await namespace.resourceExists(type, rid)) {
                return namespace.getResource(type, rid);
            }
        }

        return null;
    }

    static async getAll(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<ResourcePipeline> {
        const instances = [];
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            const namespaces = matchedSetup.locations.map(location =>
                this.instances[location].getOrCreateNamespace(
                    matchedSetup.qualifiedName,
                ),
            );
            for await (const namespace of namespaces) {
                if (await namespace.hasResource(type, name, category)) {
                    instances.push(
                        await namespace.getOrCreateResource(
                            type,
                            name,
                            category,
                        ),
                    );
                }
            }
        }

        return new ResourcePipeline(type, instances);
    }

    static async retrieveAll(
        type: EResourceType,
        rid: string,
    ): Promise<ResourcePipeline> {
        const instances = [];
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            const namespaces = matchedSetup.locations.map(location =>
                this.instances[location].getOrCreateNamespace(
                    matchedSetup.qualifiedName,
                ),
            );
            for await (const namespace of namespaces) {
                if (await namespace.resourceExists(type, rid)) {
                    instances.push(await namespace.getResource(type, rid));
                }
            }
        }

        return new ResourcePipeline(type, instances);
    }

    static async create(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<IResourceInstance> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);

            return namespace.getOrCreateResource(type, name, category);
        }

        return null;
    }

    static async createAll(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<ResourcePipeline> {
        const instances = [];
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            const namespaces = matchedSetup.locations.map(location =>
                this.instances[location].getOrCreateNamespace(
                    matchedSetup.qualifiedName,
                ),
            );
            for await (const namespace of namespaces) {
                instances.push(
                    await namespace.getOrCreateResource(type, name, category),
                );
            }
        }

        return new ResourcePipeline(type, instances);
    }

    static async delete(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<void> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);

            if (await namespace.hasResource(type, name, category)) {
                await namespace.removeResource(type, name, category);
            }
        }
    }

    static async deleteExisting(
        location: EResourceNamespaceLocation,
        type: EResourceType,
        rid: string,
    ): Promise<void> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup && matchedSetup.locations.includes(location)) {
            const namespace = await this.instances[
                location
            ].getOrCreateNamespace(matchedSetup.qualifiedName);

            if (await namespace.resourceExists(type, rid)) {
                await namespace.removeResourceFromRID(type, rid);
            }
        }
    }

    static async deleteAll(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<void> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            const namespaces = matchedSetup.locations.map(location =>
                this.instances[location].getOrCreateNamespace(
                    matchedSetup.qualifiedName,
                ),
            );
            for await (const namespace of namespaces) {
                if (await namespace.hasResource(type, name, category)) {
                    await namespace.removeResource(type, name, category);
                }
            }
        }
    }

    static async deleteAllExisting(
        type: EResourceType,
        rid: string,
    ): Promise<void> {
        const matchedSetup = this.setupList.find(
            setup => setup.resourceType == type,
        );
        if (matchedSetup) {
            const namespaces = matchedSetup.locations.map(location =>
                this.instances[location].getOrCreateNamespace(
                    matchedSetup.qualifiedName,
                ),
            );
            for await (const namespace of namespaces) {
                if (await namespace.resourceExists(type, rid)) {
                    await namespace.removeResourceFromRID(type, rid);
                }
            }
        }
    }
}

export class ResourcePipeline {
    private resouceType: EResourceType;
    private pipedInstances: IResourceInstance[];

    constructor(type: EResourceType, instances?: IResourceInstance[]) {
        this.resouceType = type;

        if (instances) {
            this.pipedInstances = [...instances.filter(instance => instance)];
        } else {
            this.pipedInstances = [];
        }
    }

    get Type(): EResourceType {
        return this.resouceType;
    }

    get Resources(): IResourceInstance[] {
        return [...this.pipedInstances];
    }

    get PrimaryResource(): IResourceInstance {
        return this.pipedInstances.length > 0 ? this.pipedInstances[0] : null;
    }

    pipe(instance: IResourceInstance): ResourcePipeline {
        this.pipedInstances.push(instance);
        return this;
    }

    async fromFile(filename: string): Promise<ResourcePipeline> {
        if (this.pipedInstances.length > 0) {
            await Promise.all(
                this.pipedInstances.map(instance =>
                    instance.fromFile(filename),
                ),
            );
        }

        return this;
    }

    async fromStream(
        stream: ReadStream,
        bufferSize?: number,
        concurrency?: number,
    ): Promise<ResourcePipeline> {
        if (this.pipedInstances.length > 0) {
            await Promise.all(
                this.pipedInstances.map(instance =>
                    instance.fromStream(stream, bufferSize, concurrency),
                ),
            );
        }

        return this;
    }

    async toFile(filename?: string): Promise<ResourcePipeline> {
        if (this.PrimaryResource) {
            this.PrimaryResource.toFile(filename);
        }

        return this;
    }

    async toBuffer(): Promise<Buffer> {
        if (this.PrimaryResource) {
            return await this.PrimaryResource.toBuffer();
        }

        return null;
    }

    async hasAnyBinding(): Promise<boolean> {
        return (
            this.pipedInstances.find(
                async instance => await instance.hasBinding(),
            ) !== undefined
        );
    }

    async hasAllBindings(): Promise<boolean> {
        return this.pipedInstances.every(
            async instance => await instance.hasBinding(),
        );
    }

    async removeBinding(): Promise<ResourcePipeline> {
        if (this.pipedInstances.length > 0) {
            await Promise.all(
                this.pipedInstances.map(instance => instance.removeBinding()),
            );
        }

        return this;
    }
}
