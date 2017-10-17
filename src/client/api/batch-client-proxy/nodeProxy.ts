import { BatchServiceClient, BatchServiceModels } from "azure-batch-js";

import { BatchResult } from "./models";
import { ListProxy, mapGet, wrapOptions } from "./shared";

export default class NodeProxy {

    constructor(private client: BatchServiceClient) {
    }

    public list(poolId: string, options?: BatchServiceModels.ComputeNodeListOptions) {
        return new ListProxy(this.client.computeNode, [poolId],
            wrapOptions({ computeNodeListOptions: options }));
    }

    public get(poolId: string, nodeId: string, options?: any): Promise<BatchResult> {
        return mapGet(this.client.computeNode.get(poolId, nodeId, wrapOptions(options)));
    }

    /**
     * Restarts the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reboot
     * @param options: Optional Parameters.
     */
    public reboot(poolId: string, nodeId: string, options?: any): Promise<any> {
        return this.client.computeNode.reboot(poolId, nodeId, wrapOptions(options));
    }

    /**
     * Reinstalls the operating system on the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to delete
     * @param options: Optional Parameters.
     */
    public delete(poolId: string, nodeId: string, options?: any): Promise<any> {
        return this.client.pool.removeNodes(poolId, { nodeList: [nodeId] }, wrapOptions(options));
    }

    /**
     * Reinstalls the operating system on the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reimage
     * @param options: Optional Parameters.
     */
    public reimage(poolId: string, nodeId: string, options?: any): Promise<any> {
        return this.client.computeNode.reimage(poolId, nodeId, wrapOptions(options));
    }

    /**
     * Adds a user account to the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reboot
     * @param user: The user account to be created.
     */
    public addUser(poolId: string, nodeId: string, user: any, options?: any): Promise<any> {
        return this.client.computeNode.addUser(poolId, nodeId, user, wrapOptions(options));
    }

    /**
     * Adds a user account to the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reboot
     * @param user: The user account to be updated.
     */
    public updateUser(poolId: string, nodeId: string, username: string, user: any, options?: any): Promise<any> {
        return this.client.computeNode.updateUser(poolId, nodeId, username, user, wrapOptions(options));
    }

    /**
     * Adds a user account to the specified compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to reboot
     * @param userName: The username of the account to delete
     */
    public deleteUser(poolId: string, nodeId: string, userName: string, options?: any): Promise<any> {
        return this.client.computeNode.deleteUser(poolId, nodeId, userName, wrapOptions(options));
    }

    public getRemoteDesktop(poolId: string, nodeId: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.computeNode.getRemoteDesktop(
                poolId, nodeId, wrapOptions({ computeNodeGetRemoteDesktopOptions: options }),
                (error, result, request, response) => {
                    if (error) { return reject(error); }
                    if (result) {
                        const chunks = [];
                        result.on("data", (chunk) => {
                            chunks.push(chunk);
                        });

                        result.on("end", () => {
                            resolve({
                                result,
                                content: Buffer.concat(chunks),
                                request,
                                response,
                            });
                        });
                    }
                });
        });
    }

    /**
     * Gets the settings required for remote login to a compute node.
     * @param poolId: The id of the pool.
     * @param nodeId: The id of the node to get the info
     */
    public getRemoteLoginSettings(poolId: string, nodeId: string, options?: any): Promise<any> {
        return mapGet(this.client.computeNode.getRemoteLoginSettings(poolId, nodeId, wrapOptions(options)));
    }
}
