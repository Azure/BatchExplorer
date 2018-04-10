import { BatchServiceClient, BatchServiceModels } from "azure-batch";

import { BatchResult } from "./models";
import { ListProxy, mapGet, wrapOptions } from "./shared";

export class PoolProxy {

    constructor(private client: BatchServiceClient) { }

    /**
     * Lists all of the pools in the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchServiceModels.PoolListOptions) {
        return new ListProxy(this.client.pool, null, wrapOptions({ poolListOptions: options }));
    }

    /**
     * Gets information about the specified pool.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#get
     * @param poolId: The id of the pool.
     * @param options: Optional Parameters.
     */
    public get(poolId: string, options?: BatchServiceModels.PoolGetOptions): Promise<BatchResult> {
        return mapGet(this.client.pool.get(poolId, wrapOptions({ poolGetOptions: options })));
    }

    /**
     * Deletes a pool.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#deleteMethod
     * @param poolId: The id of the pool to delete.
     * @param options: Optional Parameters.
     */
    public delete(poolId: string, options?: any): Promise<any> {
        return this.client.pool.deleteMethod(poolId, wrapOptions(options));
    }

    /**
     * Resizes the specified pool to the target number of nodes
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#resize
     * @param poolId: The id of the pool to resize.
     * @param targetDedicated: The desired number of nodes in the pool
     * @param options: Optional Parameters.
     */
    public resize(poolId: string, target: any, options?: any): Promise<any> {
        return this.client.pool.resize(poolId, target, wrapOptions(options));
    }

    public patch(poolId: string, attributes: any, options?: any): Promise<any> {
        return this.client.pool.patch(poolId, attributes, wrapOptions(options));
    }

    public replaceProperties(poolId: string, attributes: any, options?: any): Promise<any> {
        return this.client.pool.updateProperties(poolId, attributes, wrapOptions(options));
    }

    /**
     * Adds a pool to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#add
     * @param pool: The pool object
     * @param options: Optional Parameters.
     */
    public add(pool: any, options?: any): Promise<any> {
        return this.client.pool.add(pool, wrapOptions(options));
    }

    public enableAutoScale(
        poolId: string,
        attributes: BatchServiceModels.PoolEnableAutoScaleParameter,
        options?: any): Promise<any> {

        return this.client.pool.enableAutoScale(poolId, attributes, wrapOptions(options));
    }

    public disableAutoScale(poolId: string, options?: any): Promise<any> {
        return this.client.pool.disableAutoScale(poolId, wrapOptions(options));
    }

    public evaluateAutoScale(poolId: string, formula: string, options?: any): Promise<any> {
        return this.client.pool.evaluateAutoScale(poolId, { autoScaleFormula: formula }, wrapOptions(options));
    }
}
