import * as uuidv4 from 'uuid/v4';
import * as uuidv5 from 'uuid/v5';
import path from 'path';

import {
    IResourceNamespace,
    EResourceNamespaceLocation,
    EResourceType,
    IResource,
} from '../interfaces/resource';
import {
    DataNotFoundError,
    DuplicateDataError,
    DatabaseOperationError,
} from '../internals/errors';
import {
    ResourceNamespace,
    Resource,
    IResourceModel,
    IResourceNamespaceModel,
} from '../models/resource';

export class ResourceNamespaceMappings {
    /**
     * Retreives whether or not the namespace exists.
     * @param name name of the namespace to retrieve
     * @param location location of the namespace in which the namespace is contained
     * @returns true if the resource exists; false otherwise
     * @throws {DatabaseOperationError}
     */
    static async exists(
        name: string,
        location: EResourceNamespaceLocation,
    ): Promise<boolean> {
        try {
            return (await ResourceNamespace.findOne({
                name: name,
                location: location,
            }))
                ? true
                : false;
        } catch (err) {
            throw new DatabaseOperationError(
                ResourceNamespace.db.db.databaseName,
                'findOne()',
                `Encountered error during ${ResourceNamespace.modelName}.findOne()`,
                err,
            );
        }
    }

    /**
     * Inserts a new namespace mapping into database.
     * @param name name of the namespace to insert
     * @param location a string indicating the location of the namespace
     * @returns registered namespace
     * @throws {DuplicateDataError | DatabaseOperationError}
     */
    static async register(
        name: string,
        location: EResourceNamespaceLocation,
    ): Promise<IResourceNamespaceModel> {
        try {
            if (await this.exists(name, location)) {
                throw new DuplicateDataError(
                    name,
                    ResourceNamespace.modelName,
                    `Resource Namespace ${location}@${name} already exists`,
                );
            }

            const newNamespace = new ResourceNamespace({
                name: name,
                uuid: uuidv4(),
                location: location,
            });
            await newNamespace.save();

            return newNamespace;
        } catch (err) {
            if (err instanceof DatabaseOperationError) {
                throw err;
            } else {
                throw new DatabaseOperationError(
                    ResourceNamespace.db.db.databaseName,
                    'save()',
                    `Encountered error during ${ResourceNamespace.modelName}.save()`,
                    err,
                );
            }
        }
    }

    /**
     * Removes an existing namespace mapping from database.
     * @param name name of the namespace to remove
     * @param location a string indicating the location of the namespace
     * @throws {DatabaseOperationError}
     */
    static async unregister(
        name: string,
        location: EResourceNamespaceLocation,
    ) {
        try {
            if (await this.exists(name, location)) {
                await ResourceNamespace.deleteOne({
                    name: name,
                    location: location,
                });
            }
        } catch (err) {
            if (err instanceof DatabaseOperationError) {
                throw err;
            } else {
                throw new DatabaseOperationError(
                    ResourceNamespace.db.db.databaseName,
                    'deleteOne()',
                    `Encountered error during ${ResourceNamespace.modelName}.deleteOne()`,
                    err,
                );
            }
        }
    }

    /**
     * Retrieves the existing mapping for the given namespace.
     * @param name name of the namespace to retreive
     * @param location a stirng indicating the location of the namespace
     * @returns mapping of the namespace
     * @throws {DataNotFoundError | DatabaseOperationError}
     */
    static async getMapping(
        name: string,
        location: string,
    ): Promise<IResourceNamespaceModel> {
        try {
            const foundMapping = await ResourceNamespace.findOne({
                name: name,
                location: location,
            });
            if (!foundMapping) {
                throw new DataNotFoundError(name, ResourceNamespace.modelName);
            }

            return foundMapping;
        } catch (err) {
            throw new DatabaseOperationError(
                ResourceNamespace.db.db.databaseName,
                'findOne()',
                `Encountered error during ${ResourceNamespace.modelName}.findOne()`,
                err,
            );
        }
    }

    /**
     * Retrieves all the mappings of existing namespaces
     * @returns all the mappings of namespaces as an array
     * @throws {DatabaseOperationError}
     */
    static async getAllMappings(): Promise<IResourceNamespaceModel[]> {
        try {
            return ResourceNamespace.find();
        } catch (err) {
            throw new DatabaseOperationError(
                ResourceNamespace.db.db.databaseName,
                'find()',
                `Encountered error during ${ResourceNamespace.modelName}.find()`,
                err,
            );
        }
    }
}

export class ResourceMappings {
    /**
     * Generates a unique RID (Resource Identifier) for the given name.
     * @param resourceName name of the resource
     * @param namespace namespace mapping of the resource
     * @returns a unique RID generated from the given parameters
     */
    static generateRID(
        resourceName: string,
        namespace: IResourceNamespace,
        category?: string,
    ): string {
        return uuidv5(
            (category ? category + '/' : '') + resourceName,
            namespace.uuid,
        );
    }

    /**
     * Retreives whether or not a mapping for the specified resource exists.
     * @param type type of the resource
     * @param rid unique resource id of the resource
     * @returns true if the resource exists; false otherwise
     * @throws {DatabaseOperationError}
     */
    static async has(type: EResourceType, rid: string): Promise<boolean> {
        try {
            return (await Resource.findOne({
                type,
                rid,
            }))
                ? true
                : false;
        } catch (err) {
            throw new DatabaseOperationError(
                Resource.db.db.databaseName,
                'findOne()',
                `Encountered error during ${Resource.modelName}.findOne()`,
                err,
            );
        }
    }

    /**
     * Retreives whether or not the specified resource exists.
     * @param type type of the resource
     * @param name name of the namespace to retrieve
     * @param namespace namespace in which the resource is stored
     * @param category category of the resource (optional)
     * @returns true if the resource exists; false otherwise
     * @throws {DatabaseOperationError}
     */
    static async exists(
        type: EResourceType,
        name: string,
        namespace: IResourceNamespaceModel,
        category?: string,
    ): Promise<boolean> {
        return this.has(type, this.generateRID(name, namespace, category));
    }

    /**
     * Inserts a new resource mapping into database.
     * @param type type of the resource
     * @param name name of the namespace to retrieve
     * @param namespace namespace to store the resource
     * @param category category of the resource (optional)
     * @returns registered resource
     * @throws {DuplicateDataError | DatabaseOperationError}
     */
    static async register(
        type: EResourceType,
        name: string,
        namespace: IResourceNamespaceModel,
        category?: string,
    ): Promise<IResourceModel> {
        try {
            if (await this.exists(type, name, namespace, category)) {
                throw new DuplicateDataError(
                    name,
                    Resource.modelName,
                    `Resource ${type}:${name} already exists in ${namespace.location}@${namespace.name}`,
                );
            }
            const newResource = new Resource({
                type: type,
                namespace: namespace.id,
                rid: this.generateRID(name, namespace, category),
                category: category,
                sourceName: name,
            });
            await newResource.save();

            return newResource;
        } catch (err) {
            if (err instanceof DatabaseOperationError) {
                throw err;
            } else {
                throw new DatabaseOperationError(
                    Resource.db.db.databaseName,
                    'save()',
                    `Encountered error during ${Resource.modelName}.save()`,
                    err,
                );
            }
        }
    }

    /**
     * Removes an existing resource mapping from database.
     * @param type type of the resource
     * @param rid unique resource id of the resource
     * @throws {DatabaseOperationError}
     */
    static async unregisterFromRID(type: EResourceType, rid: string) {
        try {
            if (await this.has(type, rid)) {
                await Resource.deleteOne({
                    type,
                    rid,
                });
            }
        } catch (err) {
            if (err instanceof DatabaseOperationError) {
                throw err;
            } else {
                throw new DatabaseOperationError(
                    Resource.db.db.databaseName,
                    'deleteOne()',
                    `Encountered error during ${Resource.modelName}.deleteOne()`,
                    err,
                );
            }
        }
    }

    /**
     * Removes an existing resource mapping from database.
     * @param type type of the resource
     * @param name name of the namespace to retrieve
     * @param namespace namespace in which the resource is stored
     * @param category category of the resource (optional)
     * @throws {DatabaseOperationError}
     */
    static async unregister(
        type: EResourceType,
        name: string,
        namespace: IResourceNamespaceModel,
        category?: string,
    ) {
        return this.unregisterFromRID(
            type,
            this.generateRID(name, namespace, category),
        );
    }

    /**
     * Retrieves an existing mapping for the given resource.
     * @param type type of the resource
     * @param rid unique resource id of the resource
     * @returns mapping of the resource
     * @throws {DataNotFoundError | DatabaseOperationError}
     */
    static async getMappingFromRID(
        type: EResourceType,
        rid: string,
    ): Promise<IResourceModel> {
        try {
            const foundMapping = await Resource.findOne({
                type,
                rid,
            });
            if (!foundMapping) {
                throw new DataNotFoundError(name, Resource.modelName);
            }

            return foundMapping;
        } catch (err) {
            throw new DatabaseOperationError(
                Resource.db.db.databaseName,
                'findOne()',
                `Encountered error during ${Resource.modelName}.findOne()`,
                err,
            );
        }
    }

    /**
     * Retrieves the existing mapping for the given resource.
     * @param type type of the resource
     * @param name name of the namespace to retrieve
     * @param namespace namespace in which the resource is stored
     * @param category category of the resource (optional)
     * @returns mapping of the resource
     * @throws {DataNotFoundError | DatabaseOperationError}
     */
    static async getMapping(
        type: EResourceType,
        name: string,
        namespace: IResourceNamespace,
        category?: string,
    ): Promise<IResourceModel> {
        return this.getMappingFromRID(
            type,
            this.generateRID(name, namespace, category),
        );
    }

    /**
     * Retrieves all the mappings of existing resources
     * @returns array of mappings of all the resources
     * @throws {DatabaseOperationError}
     */
    static async getAllMappings(): Promise<IResourceModel[]> {
        try {
            return Resource.find();
        } catch (err) {
            throw new DatabaseOperationError(
                Resource.db.db.databaseName,
                'find()',
                `Encountered error during ${Resource.modelName}.find()`,
                err,
            );
        }
    }

    /**
     * Retrieves all the mappings of resources in the given namespace
     * @returns array of mappings in the namespace
     * @throws {DatabaseOperationError}
     */
    static async getAllMappingsInNamespace(
        namespace: IResourceNamespaceModel,
    ): Promise<IResourceModel[]> {
        try {
            return await Resource.find({ namespace: namespace.id });
        } catch (err) {
            throw new DatabaseOperationError(
                Resource.db.db.databaseName,
                'find()',
                `Encountered error during ${
                    Resource.modelName
                }.find() with {namespace=${ResourceNamespaces.getQualifiedName(
                    namespace,
                )}}`,
                err,
            );
        }
    }
}

export class ResourceNamespaces {
    /**
     * Creates a qualified name with the given namespaceName and location
     * @param namespaceName name of the namespace to build a qualified name from
     * @param location location of the namespace
     * @returns qualified name
     */
    static createQualifiedName(
        namespaceName: string,
        location: EResourceNamespaceLocation,
    ): string {
        return `${namespaceName}:${location}`;
    }
    /**
     * Retrieves a qualified name for the given namespace
     * @param namespace namespace to get a qualified name from
     * @returns qualified name for the namespace
     */
    static getQualifiedName(namespace: IResourceNamespace): string {
        return this.createQualifiedName(namespace.name, namespace.location);
    }
}

export class Resources {
    /**
     * Creates a storage name with the given RID and category (Optional)
     * @param rid a unique Resource ID of the resource
     * @param category (Optional) category of the resource
     */
    static createStorageNameWithRID(rid: string, category?: string) {
        return `${category ? category + '/' : ''}${rid}`;
    }

    /**
     * Creates a storage name with the given name, namespace, and category (Optional) of the resource
     * @param name name of the resource
     * @param namespace namespace in which the resource is stored
     * @param category (Optional) category of the resource
     */
    static createStorageName(
        name: string,
        namespace: IResourceNamespace,
        category?: string,
    ) {
        return this.createStorageNameWithRID(
            ResourceMappings.generateRID(name, namespace, category),
            category,
        );
    }

    /**
     * Retrieves a storage name for the given resource
     * @param resource resource to get a storage name from
     * @returns storage name for the resource
     */
    static getStorageName(resource: IResource): string {
        return this.createStorageNameWithRID(resource.rid, resource.category);
    }

    /**
     * Creates a qualified name of the resource with the given type, rid, namespace, and category (Optional)
     * @param type type of the resource
     * @param rid a unique Resource ID of the resource
     * @param namespace namespace in which the resource is stored
     * @param category (Optional) category of the resource
     */
    static createQualifiedNameWithRID(
        type: EResourceType,
        rid: string,
        namespace: IResourceNamespace,
        category?: string,
    ) {
        return `${type}://${this.createStorageNameWithRID(
            rid,
            category,
        )}@${ResourceNamespaces.getQualifiedName(namespace)}`;
    }

    /**
     * Creates a qualified name of the resource with the given type, name, namespace, and category (Optional)
     * @param type type of the resource
     * @param name name of the resource
     * @param namespace namespace in which the resource is stored
     * @param category (Optional) category of the resource
     */
    static createQualifiedName(
        type: EResourceType,
        name: string,
        namespace: IResourceNamespace,
        category?: string,
    ) {
        return this.createQualifiedNameWithRID(
            type,
            ResourceMappings.generateRID(name, namespace, category),
            namespace,
            category,
        );
    }

    /**
     * Retrieves a qualified name of the given resource
     * @param resource resource to get a qualified name from
     * @returns qualified name for the resource
     */
    static getQualifiedName(resource: IResource): string {
        return this.createQualifiedNameWithRID(
            resource.type,
            resource.rid,
            resource.namespace,
            resource.category,
        );
    }
}
