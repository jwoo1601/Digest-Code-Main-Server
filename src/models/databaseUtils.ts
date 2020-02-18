export interface IOperationResult {
    error?: any;
    result?: any;
}

export class DatabaseUtils {
    static GuardOperation(operation: any, ...params: any[]): IOperationResult {
        if (!(operation instanceof Function)) {
            return {
                error: '{operation} is not a function',
            };
        }

        try {
            return {
                result: operation(...params),
            };
        } catch (err) {
            return {
                error: err,
            };
        }
    }

    static async GuardAsyncOperation(
        operation: any,
        ...params: any[]
    ): Promise<IOperationResult> {
        try {
            if (!(operation instanceof Function)) {
                return {
                    error: '{operation} is not a function',
                };
            }

            return {
                result: await operation(...params),
            };
        } catch (err) {
            return {
                error: err,
            };
        }
    }
}
