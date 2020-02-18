import winston from 'winston';
import { ReadStream } from 'fs';
import {
    BlobServiceClient,
    ContainerClient,
    StorageSharedKeyCredential,
    Metadata,
    BlockBlobClient,
} from '@azure/storage-blob';
import {
    IResourceNamespace,
    EResourceNamespaceLocation,
    IResource,
    EResourceType,
} from '../interfaces/resource';
import {
    IResourceInstance,
    IResourceNamespaceInstance,
    IResourceStorage,
} from '../interfaces/resourceStorage';
import {
    ResourceNamespaceMappings,
    Resources,
    ResourceNamespaces,
    ResourceMappings,
} from './resource';
import { IResourceNamespaceModel } from '../models/resource';

export class AzureBlobResourceInstance implements IResourceInstance {
    private azureClient: BlockBlobClient;
    private resource: IResource;
    private logger: winston.Logger;

    constructor(
        azureClient: BlockBlobClient,
        resource: IResource,
        logger: winston.Logger,
    ) {
        this.azureClient = azureClient;
        this.resource = resource;
        this.logger = logger;
    }

    /**
     * Retrieves a resource object of this instance.
     * @returns corresponding resource object
     */
    getResource(): IResource {
        return this.resource;
    }

    /**
     * (Chainable) Binds the specified file to the resource.
     * @param filename full path of the file
     * @returns resource instance
     */
    async fromFile(filename: string): Promise<AzureBlobResourceInstance> {
        try {
            await this.azureClient.uploadFile(filename);
        } catch (err) {
            this.logger.error(
                `Failed to bind a file {${filename}} to Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} in AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    /**
     * (Chainable) Binds the given stream to the resource.
     * @param stream stream to bind
     * @param bufferSize size of the buffer used to sync the stream (Optional)
     * @param concurrency number of maximum buffers used concurrently to sync the stream (Optional)
     * @returns resource instance
     */
    async fromStream(
        stream: ReadStream,
        bufferSize?: number,
        concurrency?: number,
    ): Promise<AzureBlobResourceInstance> {
        try {
            await this.azureClient.uploadStream(
                stream,
                bufferSize,
                concurrency,
            );
        } catch (err) {
            this.logger.error(
                `Failed to bind a stream to Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} in AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    // async fromUrl(url: string);

    /**
     * Creates a local file with the given name and transfers the content of the resource to the file.
     * (Fails when the file already exists)
     * @param filename name of the file to create
     * @returns resource instance
     */
    async toFile(filename?: string): Promise<AzureBlobResourceInstance> {
        const localFilename = filename || this.resource.sourceName;

        try {
            await this.azureClient.downloadToFile(localFilename);
        } catch (err) {
            this.logger.error(
                `Failed to save Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} as File {${localFilename}} in AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    /**
     * Saves the content of the resource into a buffer
     * @returns buffer which contains the resource data
     */
    async toBuffer(): Promise<Buffer> {
        try {
            await this.azureClient.downloadToBuffer();
        } catch (err) {
            this.logger.error(
                `Failed to save Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} into a Buffer in AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return null;
    }

    /**
     * Retrieves whether or not if the resource has binding in the storage
     */
    async hasBinding(): Promise<boolean> {
        try {
            return await this.azureClient.exists();
        } catch (err) {
            this.logger.error(
                `Failed to retreive the binding of Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} from AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }
    }

    /**
     * (Chainable) Removes the binding of the resource from the storage
     * @returns resource instance
     */
    async removeBinding(): Promise<AzureBlobResourceInstance> {
        try {
            await this.azureClient.delete();
        } catch (err) {
            this.logger.error(
                `Failed to remove the binding of Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} from AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    /**
     * (Chainable) Recovers the previous binding of the resource in the storage if possible
     * @returns resource instance
     */
    async recoverBinding(): Promise<AzureBlobResourceInstance> {
        try {
            await this.azureClient.undelete();
        } catch (err) {
            this.logger.error(
                `Failed to recover the previous binding of Resource {${Resources.getQualifiedName(
                    this.resource,
                )}} in AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    resource: this.resource,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }
}

export class AzureBlobResourceNamespaceInstance
    implements IResourceNamespaceInstance {
    private azureClient: ContainerClient;
    private namespace: IResourceNamespaceModel;
    private logger: winston.Logger;

    constructor(
        azureClient: ContainerClient,
        namespace: IResourceNamespaceModel,
        logger: winston.Logger,
    ) {
        this.azureClient = azureClient;
        this.namespace = namespace;
        this.logger = logger;
    }

    getNamespace(): IResourceNamespace {
        return this.namespace;
    }

    async mappingExists(type: EResourceType, rid: string): Promise<boolean> {
        try {
            return await ResourceMappings.has(type, rid);
        } catch (err) {
            const qualifiedName = Resources.createQualifiedNameWithRID(
                type,
                rid,
                this.namespace,
            );
            this.logger.error(
                `Failed to retreive a resource mapping for Resource {${qualifiedName} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return false;
    }

    async hasResourceMapping(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        try {
            return await ResourceMappings.exists(
                type,
                name,
                this.namespace,
                category,
            );
        } catch (err) {
            const qualifiedName = Resources.createQualifiedName(
                type,
                name,
                this.namespace,
                category,
            );
            this.logger.error(
                `Failed to retreive a resource mapping for Resource {${qualifiedName} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return false;
    }

    async resourceExists(type: EResourceType, rid: string): Promise<boolean> {
        try {
            if (await ResourceMappings.has(type, rid)) {
                const mapping = await ResourceMappings.getMappingFromRID(
                    type,
                    rid,
                );
                return this.azureClient
                    .getBlockBlobClient(Resources.getStorageName(mapping))
                    .exists();
            }
        } catch (err) {
            const qualifiedName = Resources.createQualifiedNameWithRID(
                type,
                rid,
                this.namespace,
            );
            this.logger.error(
                `Failed to retreive a resource instance for Resource {${qualifiedName} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return false;
    }

    async hasResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<boolean> {
        try {
            if (
                await ResourceMappings.exists(
                    type,
                    name,
                    this.namespace,
                    category,
                )
            ) {
                const mapping = await ResourceMappings.getMapping(
                    type,
                    name,
                    this.namespace,
                    category,
                );
                return this.azureClient
                    .getBlockBlobClient(Resources.getStorageName(mapping))
                    .exists();
            }
        } catch (err) {
            const qualifiedName = Resources.createQualifiedName(
                type,
                name,
                this.namespace,
                category,
            );
            this.logger.error(
                `Failed to retreive a resource instance for Resource {${qualifiedName} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return false;
    }

    async getResource(
        type: EResourceType,
        rid: string,
    ): Promise<AzureBlobResourceInstance> {
        try {
            if (!this.resourceExists(type, rid)) {
                return null;
            }

            const mapping = await ResourceMappings.getMappingFromRID(type, rid);

            return new AzureBlobResourceInstance(
                this.azureClient.getBlockBlobClient(
                    Resources.getStorageName(mapping),
                ),
                mapping,
                this.logger,
            );
        } catch (err) {
            const qualifiedName = Resources.createQualifiedNameWithRID(
                type,
                rid,
                this.namespace,
            );
            this.logger.error(
                `Failed to get or create Resource instance for {${qualifiedName}} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return null;
    }

    async getOrCreateResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<AzureBlobResourceInstance> {
        try {
            let mapping;
            if (this.hasResource(type, name, category)) {
                mapping = await ResourceMappings.getMapping(
                    type,
                    name,
                    this.namespace,
                    category,
                );
            } else {
                mapping = await ResourceMappings.register(
                    type,
                    name,
                    this.namespace,
                    category,
                );
            }

            return new AzureBlobResourceInstance(
                this.azureClient.getBlockBlobClient(
                    Resources.getStorageName(mapping),
                ),
                mapping,
                this.logger,
            );
        } catch (err) {
            const qualifiedName = Resources.createQualifiedName(
                type,
                name,
                this.namespace,
                category,
            );
            this.logger.error(
                `Failed to get or create Resource instance for {${qualifiedName}} in AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return null;
    }

    async removeResourceFromRID(
        type: EResourceType,
        rid: string,
    ): Promise<AzureBlobResourceNamespaceInstance> {
        try {
            if (this.mappingExists(type, rid)) {
                const instance = await this.getResource(type, rid);
                if (instance && instance.hasBinding()) {
                    await instance.removeBinding();
                }

                await ResourceMappings.unregisterFromRID(type, rid);
            }
        } catch (err) {
            const qualifiedName = Resources.createQualifiedNameWithRID(
                type,
                rid,
                this.namespace,
            );
            this.logger.error(
                `Failed to remove Resource {${qualifiedName}} from AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    async removeResource(
        type: EResourceType,
        name: string,
        category?: string,
    ): Promise<AzureBlobResourceNamespaceInstance> {
        try {
            if (this.hasResourceMapping(type, name, category)) {
                const instance = await this.getOrCreateResource(
                    type,
                    name,
                    category,
                );
                if (instance && instance.hasBinding()) {
                    await instance.removeBinding();
                }

                await ResourceMappings.unregister(
                    type,
                    name,
                    this.namespace,
                    category,
                );
            }
        } catch (err) {
            const qualifiedName = Resources.createQualifiedName(
                type,
                name,
                this.namespace,
                category,
            );
            this.logger.error(
                `Failed to remove Resource {${qualifiedName}} from AzureBlobResourceStorage {${this.azureClient.accountName}}`,
                {
                    namespace: this.namespace,
                    resource: qualifiedName,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }

        return this;
    }

    async getAllResources(): Promise<AzureBlobResourceInstance[]> {
        try {
            return await (
                await ResourceMappings.getAllMappingsInNamespace(this.namespace)
            ).map(
                m =>
                    new AzureBlobResourceInstance(
                        this.azureClient.getBlockBlobClient(
                            Resources.getStorageName(m),
                        ),
                        m,
                        this.logger,
                    ),
            );
        } catch (err) {
            this.logger.error(
                `Failed to retrieve all the Resources in ${ResourceNamespaces.getQualifiedName(
                    this.namespace,
                )} from AzureBlobResourceStorage {${
                    this.azureClient.accountName
                }}`,
                {
                    namespace: this.namespace,
                    azure: this.azureClient.accountName,
                    error: err,
                },
            );
        }
    }
}

export class AzureBlobResourceStorage implements IResourceStorage {
    private azureClient: BlobServiceClient;
    private logger: winston.Logger;
    readonly accountName: string;
    readonly accessKey: string;

    constructor(
        accountName: string,
        accessKey: string,
        logger?: winston.Logger,
    ) {
        this.accountName = accountName;
        this.accessKey = accessKey;
        this.azureClient = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net/`,
            new StorageSharedKeyCredential(accountName, accessKey),
        );
        if (logger) {
            this.logger = logger;
        } else {
            this.logger = winston.loggers.get('resource');
        }
    }

    async hasNamespaceMapping(name: string): Promise<boolean> {
        try {
            return await ResourceNamespaceMappings.exists(
                name,
                EResourceNamespaceLocation.REMOTE_AZURE,
            );
        } catch (err) {
            this.logger.error(
                `Failed to retreive a mapping for Namespace {${ResourceNamespaces.createQualifiedName(
                    name,
                    EResourceNamespaceLocation.REMOTE_AZURE,
                )}} from database`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }

    async hasNamespaceInstance(name: string): Promise<boolean> {
        try {
            return await this.azureClient.getContainerClient(name).exists();
        } catch (err) {
            this.logger.error(
                `Failed to retreive a namespace instance for Namespace {${name} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }

    async hasNamespace(name: string): Promise<boolean> {
        return (
            (await this.hasNamespaceMapping(name)) &&
            (await this.hasNamespaceInstance(name))
        );
    }

    async getOrCreateNamespace(
        name: string,
        label?: string,
    ): Promise<AzureBlobResourceNamespaceInstance> {
        let mapping: IResourceNamespaceModel;
        let client: ContainerClient;

        try {
            if (
                await ResourceNamespaceMappings.exists(
                    name,
                    EResourceNamespaceLocation.REMOTE_AZURE,
                )
            ) {
                mapping = await ResourceNamespaceMappings.getMapping(
                    name,
                    EResourceNamespaceLocation.REMOTE_AZURE,
                );
            } else {
                mapping = await ResourceNamespaceMappings.register(
                    name,
                    EResourceNamespaceLocation.REMOTE_AZURE,
                );
            }

            const client = this.azureClient.getContainerClient(name);
            if (!(await client.exists())) {
                const response = client.create(
                    label && { metadata: { label: label } },
                );
                this.logger.info(
                    `Created a namespace in AzureBlobResourceStorage {${this.accountName}}`,
                    { response: response },
                );
            }
        } catch (err) {
            this.logger.error(
                `Failed to create a namespace {${name}} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }

        return mapping
            ? new AzureBlobResourceNamespaceInstance(
                  client,
                  mapping,
                  this.logger,
              )
            : null;
    }

    async forceDeleteNamespace(name: string) {
        try {
            if (await this.hasNamespace(name)) {
                if (await this.hasNamespaceMapping(name)) {
                    await ResourceNamespaceMappings.unregister(
                        name,
                        EResourceNamespaceLocation.REMOTE_AZURE,
                    );
                }

                if (await this.hasNamespaceInstance(name)) {
                    await this.azureClient.getContainerClient(name).delete();
                }
            } else {
                this.logger.warn(
                    `Forced deletion of a namespace {${name}} was not executed; the namespace does not exist`,
                );
            }
        } catch (err) {
            this.logger.error(
                `Failed to forcefully delete a namespace {${name}} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }

    async isNamespaceEmpty(name: string): Promise<boolean> {
        try {
            return await (
                await this.azureClient
                    .getContainerClient(name)
                    .listBlobsFlat()
                    .next()
            ).done;
        } catch (err) {
            this.logger.error(
                `Failed to retreive a namespace {${name}} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }

    async deleteNamespaceIfEmpty(name: string) {
        try {
            if (await this.isNamespaceEmpty(name)) {
                await this.azureClient.getContainerClient(name).delete();
            }
        } catch (err) {
            this.logger.error(
                `Failed to delete an empty namespace {${name}} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }

    async getAllNamespaces(): Promise<AzureBlobResourceNamespaceInstance[]> {
        try {
            const mappings = await ResourceNamespaceMappings.getAllMappings();
            return mappings
                .filter(
                    m => m.location == EResourceNamespaceLocation.REMOTE_AZURE,
                )
                .map(
                    m =>
                        new AzureBlobResourceNamespaceInstance(
                            this.azureClient.getContainerClient(m.name),
                            m,
                            this.logger,
                        ),
                );
        } catch (err) {
            this.logger.error(
                `Failed to retreive existing namespaces {${name}} in AzureBlobResourceStorage {${this.accountName}}`,
                { namespace: name, azure: this.accountName, error: err },
            );
        }
    }
}
