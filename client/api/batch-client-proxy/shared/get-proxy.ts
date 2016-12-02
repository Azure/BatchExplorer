import { BatchResult } from "../models";

export interface GetProxyEntity {
    get: Function;
}

/**
 * Get an entity by ID from the Batch client
 */
export class GetProxy {
    constructor(private entity: GetProxyEntity) {
    }

    public execute(params: any[], options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.get(...params, options, (error, result) => {
                if (error) { return reject(error); }
                if (result) {
                    return resolve({
                        data: result,
                    });
                }
            });
        });
    }
}
