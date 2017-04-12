import { BatchRequestOptions } from "./models";
import { GetProxy, ListProxy } from "./shared";

export default class FileProxy {
    private _getProxy: GetProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.file);
    }

    public getComputeNodeFile(poolId: string, nodeId: string, filename: string, options?: BatchRequestOptions) {
        return new Promise((resolve, reject) => {
            this.client.file.getFromComputeNode(
                poolId, nodeId, filename, options, (error, result, request, response) => {
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

    public getComputeNodeFileProperties(
        poolId: string, nodeId: string, filename: string, options?: BatchRequestOptions) {
        return new Promise((resolve, reject) => {
            this.client.file.getPropertiesFromComputeNode(poolId, nodeId, filename, options,
                (error, result, request, response) => {
                    if (error) { return reject(error); }
                    const headers = response.headers;
                    const out = {
                        name: filename,
                        isDirectory: headers["ocp-batch-file-isdirectory"],
                        url: headers["ocp-batch-file-url"],
                        properties: {
                            contentLength: parseInt(headers["content-length"], 10),
                            contentType: headers["content-type"],
                            creationTime: headers["ocp-creation-time"],
                            lastModified: headers["lastModified"],
                        },
                    };
                    resolve({
                        data: out,
                    });
                });
        });
    }

    public get some() {
        return this.client.file;
    }

    public getTaskFile(jobId: string, taskId: string, filename: string, options?: BatchRequestOptions) {
        return new Promise((resolve, reject) => {
            this.client.file.getFromTask(jobId, taskId, filename, options, (error, result, request, response) => {
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

    public getTaskFileProperties(jobId: string, taskId: string, filename: string, options?: BatchRequestOptions) {
        return new Promise((resolve, reject) => {
            this.client.file.getPropertiesFromTask(jobId, taskId, filename, options,
                (error, result, request, response) => {
                    if (error) { return reject(error); }
                    const headers = response.headers;
                    const out = {
                        name: filename,
                        isDirectory: headers["ocp-batch-file-isdirectory"],
                        url: headers["ocp-batch-file-url"],
                        properties: {
                            contentLength: parseInt(headers["content-length"], 10),
                            contentType: headers["content-type"],
                            creationTime: headers["ocp-creation-time"],
                            lastModified: headers["lastModified"],
                        },
                    };
                    resolve({
                        data: out,
                    });
                });
        });
    }

    /**
     * Lists the files in a task's directory on its compute node.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/File.html#listFromTask
     * @param jobId: The id of the job that contains the task.
     * @param taskId: The id of the task whose files you want to list.
     * @param options: Optional Parameters.
     */
    public listFromTask(jobId: string, taskId: string, recursive = true, options?: BatchRequestOptions) {
        const entity = {
            list: this.client.file.listFromTask.bind(this.client.file),
            listNext: this.client.file.listFromTaskNext.bind(this.client.file),
        };

        return new ListProxy(entity,
            [jobId, taskId],
            { recursive: recursive, fileListFromTaskOptions: options });
    }

    /**
     * Lists the files in a task's directory on its compute node.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/File.html#listFromComputeNode
     * @param poolId: The id of the pool that contains the compute node.
     * @param nodeId: The id of the compute node whose files you want to list.
     * @param options: Optional Parameters.
     */
    public listFromComputeNode(poolId: string, nodeId: string, recursive = true, options?: BatchRequestOptions) {
        const entity = {
            list: this.client.file.listFromComputeNode.bind(this.client.file),
            listNext: this.client.file.listFromComputeNodeNext.bind(this.client.file),
        };

        return new ListProxy(entity,
            [poolId, nodeId],
            { recursive, fileListFromComputeNodeOptions: options });
    }
}
