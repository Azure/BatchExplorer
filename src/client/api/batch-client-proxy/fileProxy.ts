import { BatchServiceClient } from "azure-batch-js";
import { ListProxy, wrapOptions } from "./shared";

export class FileProxy {
    constructor(private client: BatchServiceClient) {
    }

    public async getComputeNodeFile(poolId: string, nodeId: string, filename: string, options?: any): Promise<any> {
        const result = await this.client.file.getFromComputeNode(poolId, nodeId, filename, wrapOptions(options));
        if (result) {
            const content = await this._readContent(result);
            return {content };
        } else {
            return { content: "" };
        }
    }

    public getComputeNodeFileProperties(
        poolId: string, nodeId: string, filename: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.file.getPropertiesFromComputeNode(poolId, nodeId, filename, wrapOptions(options),
                (error, result: any, request, response) => {
                    if (error) { return reject(error); }
                    const out = this._parseHeadersToFile(response.headers, filename);
                    resolve({
                        data: out,
                    });
                });
        });
    }

    public async getTaskFile(jobId: string, taskId: string, filename: string, options?: any): Promise<any> {
        const result = await this.client.file.getFromTask(jobId, taskId, filename, wrapOptions(options));
        if (result) {
            const content = await this._readContent(result);
            return {content };
        } else {
            return { content: "" };
        }
    }

    public getTaskFileProperties(jobId: string, taskId: string, filename: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.file.getPropertiesFromTask(jobId, taskId, filename, wrapOptions(options),
                (error, result, request, response) => {
                    if (error) { return reject(error); }
                    const out = this._parseHeadersToFile(response.headers, filename);
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
    public listFromTask(jobId: string, taskId: string, recursive = true, options?: any) {
        const entity = {
            list: this.client.file.listFromTask.bind(this.client.file),
            listNext: this.client.file.listFromTaskNext.bind(this.client.file),
        };

        return new ListProxy(entity,
            [jobId, taskId],
            wrapOptions({ recursive: recursive, fileListFromTaskOptions: options }));
    }

    /**
     * Lists the files in a task's directory on its compute node.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/File.html#listFromComputeNode
     * @param poolId: The id of the pool that contains the compute node.
     * @param nodeId: The id of the compute node whose files you want to list.
     * @param options: Optional Parameters.
     */
    public listFromComputeNode(poolId: string, nodeId: string, recursive = true, options?: any) {
        const entity = {
            list: this.client.file.listFromComputeNode.bind(this.client.file),
            listNext: this.client.file.listFromComputeNodeNext.bind(this.client.file),
        };

        return new ListProxy(entity,
            [poolId, nodeId],
            wrapOptions({ recursive, fileListFromComputeNodeOptions: options }));
    }

    private _parseHeadersToFile(headers: Headers, filename: string) {
        const contentLength = parseInt(headers.get("content-length"), 10);
        return {
            name: filename,
            isDirectory: headers.get("ocp-batch-file-isdirectory"),
            url: headers.get("ocp-batch-file-url"),
            properties: {
                contentLength: isNaN(contentLength) ? 0 : contentLength,
                contentType: headers.get("content-type"),
                creationTime: headers.get("ocp-creation-time"),
                lastModified: headers.get("last-modified"),
            },
        };
    }

    private async _readContent(stream: ReadableStream): Promise<string> {
        const reader = stream.getReader();

        let text = "";
        let result;
        while (true) {
            result = await reader.read();
            if (result.value) {
                text += new TextDecoder("utf-8").decode(result.value);
            }

            if (result.done) {
                return text;
            }
        }
    }
}
