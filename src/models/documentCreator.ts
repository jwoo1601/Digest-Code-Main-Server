import { Document } from 'mongoose';

export function convertDocumentToId(document: Document) {
    return document._id;
}

export function convertDocumentArrayToIdArray(documentArray: Document[]) {
    return documentArray.map(d => d._id);
}

export function generateDocumentCreator<T>(propConverters: object) {
    return (newDocumentInput: object): T => {
        let newDocument = {};

        Object.entries(newDocumentInput).forEach(([k, v]) => {
            const prop = Object.getOwnPropertyDescriptor(propConverters, k);
            const converter = prop ? prop.value : null;

            Object.defineProperty(newDocument, k, {
                value: converter ? converter(v) : v,
                enumerable: true,
                writable: true,
            });
        });

        return newDocument as T;
    };
}
