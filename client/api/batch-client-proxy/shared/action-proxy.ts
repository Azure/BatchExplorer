import { BatchResult } from "../models";

export interface ActionProxyEntity {
    action: Function;
}

/**
 * Can perform any described action from the Batch client
 */
export class ActionProxy {
    constructor(private entity: ActionProxyEntity) {
    }

    public execute(params: any[], options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.action(...params, options, (error, result, request, response) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
