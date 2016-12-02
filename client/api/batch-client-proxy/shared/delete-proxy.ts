import { BatchResult } from "../models";

export interface DeleteProxyEntity {
    deleteMethod: Function;
}

/**
 * Delete an entity by ID from the Batch client
 */
export class DeleteProxy {
    constructor(private entity: DeleteProxyEntity) {
    }

    public execute(params: any[], options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.deleteMethod(...params, options, (error, result, request, response) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
