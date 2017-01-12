import { BatchRequestOptions } from "./models";
import { GetProxy, ListProxy } from "./shared";

export default class NodeProxy {
    private _getProxy: GetProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.computeNodeOperations);
    }

    public list(poolId: string, options?: BatchRequestOptions) {
        return new ListProxy(this.client.computeNodeOperations, [poolId], { computeNodeListOptions: options });
    }

    public get(poolId: string, nodeId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute([poolId, nodeId], { computeNodeGetOptions: options });
    }

    /**
     * Restarts the specified compute node.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/ComputeNodeOperations.html#reboot
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reboot
     * @param options: Optional Parameters.
     */
    public reboot(poolId: string, nodeId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.computeNodeOperations.reboot(poolId, nodeId, options, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Reinstalls the operating system on the specified compute node.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/ComputeNodeOperations.html#reimage
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reimage
     * @param options: Optional Parameters.
     */
    public reimage(poolId: string, nodeId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.computeNodeOperations.reimage(poolId, nodeId, options, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
