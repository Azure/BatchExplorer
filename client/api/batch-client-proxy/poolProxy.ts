import * as moment from "moment";
import { BatchRequestOptions } from "./models";
import { DeleteProxy, GetProxy, ListProxy } from "./shared";

export default class PoolProxy {
    private _getProxy: GetProxy;
    private _deleteProxy: DeleteProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.pool);
        this._deleteProxy = new DeleteProxy(this.client.pool);
    }

    /**
     * Lists all of the pools in the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchRequestOptions) {
        return new ListProxy(this.client.pool, null, { poolListOptions: options });
    }

    /**
     * Gets information about the specified pool.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#get
     * @param poolId: The id of the pool.
     * @param options: Optional Parameters.
     */
    public get(poolId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute([poolId], { poolGetOptions: options });
    }

    /**
     * Deletes a pool.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#deleteMethod
     * @param poolId: The id of the pool to delete.
     * @param options: Optional Parameters.
     */
    public delete(poolId: string, options?: any) {
        return this._deleteProxy.execute([poolId], { poolDeleteMethodOptions: options });
    }

    /**
     * Resizes the specified pool to the target number of nodes
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#resize
     * @param poolId: The id of the pool to resize.
     * @param targetDedicated: The desired number of nodes in the pool
     * @param options: Optional Parameters.
     */
    public resize(poolId: string, targetDedicated: number, options?: any) {
        let resizeBody: any = {};
        resizeBody.targetDedicated = Number(targetDedicated);

        return new Promise((resolve, reject) => {
            this.client.pool.resize(poolId, resizeBody, { poolResizeOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    public patch(poolId: string, attributes: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.pool.patch(poolId, attributes, { poolResizeOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    public replaceProperties(poolId: string, attributes: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.pool.updateProperties(poolId, attributes, { poolResizeOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Adds a pool to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Pool.html#add
     * @param pool: The pool object
     * @param options: Optional Parameters.
     */
    public add(pool: any, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.pool.add(pool, { poolAddOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
