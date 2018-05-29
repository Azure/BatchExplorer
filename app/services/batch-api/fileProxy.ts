import { EncodingUtils } from "@batch-flask/utils";
import { BatchServiceClient } from "azure-batch";
import * as fs from "fs";
import { ListProxy, wrapOptions } from "./shared";

export class FileProxy {
    constructor(private client: BatchServiceClient) {
    }

    public async getComputeNodeFile(poolId: string, nodeId: string, filename: string, options?: any): Promise<any> {
        const result = await this.client.file.getFromComputeNode(poolId, nodeId, filename, wrapOptions(options));
        if (result) {
            const content = await this._readContent(result);
            return { content };
        } else {
            return { content: "" };
        }
    }

    public async downloadFromNode(poolId: string, nodeId: string, filename: string, destination: string): Promise<any> {
        const result = await this.client.file.getFromComputeNode(poolId, nodeId, filename);
        if (result) {
            return this._downloadContent(result, destination);
        } else {
            return false;
        }
    }

    public async getComputeNodeFileProperties(
        poolId: string, nodeId: string, filename: string, options?: any): Promise<any> {
        const { response } = await this.client.file.getPropertiesFromComputeNodeWithHttpOperationResponse(
            poolId, nodeId,
            filename, wrapOptions(options));
        return {
            data: this._parseHeadersToFile(response.headers, filename),
        };
    }

    public async getTaskFile(jobId: string, taskId: string, filename: string, options?: any): Promise<any> {
        const result = await this.client.file.getFromTask(jobId, taskId, filename, wrapOptions(options));
        if (result) {
            const content = await this._readContent(result);
            return { content };
        } else {
            return { content: "" };
        }
    }

    public async downloadFromTask(jobId: string, taskId: string, filename: string, destination: string): Promise<any> {
        const result = await this.client.file.getFromTask(jobId, taskId, filename);
        if (result) {
            return this._downloadContent(result, destination);
        } else {
            return false;
        }
    }

    public async getTaskFileProperties(jobId: string, taskId: string, filename: string, options?: any): Promise<any> {
        const { response } = await this.client.file.getPropertiesFromTaskWithHttpOperationResponse(jobId, taskId,
            filename, wrapOptions(options));
        return {
            data: this._parseHeadersToFile(response.headers, filename),
        };
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

    private async _readContent(response: Response): Promise<string> {
        const reader = response.body.getReader();

        const chunks = [];
        let result;
        while (true) {
            result = await reader.read();
            if (result.done) {
                const buffer = Buffer.concat(chunks);
                const { encoding } = await EncodingUtils.detectEncodingFromBuffer({
                    buffer,
                    bytesRead: buffer.length,
                });
                return new TextDecoder(encoding || "utf-8").decode(buffer);
            }
            chunks.push(new Buffer(result.value.buffer));
        }
    }

    private async _downloadContent(response: Response, destination: string): Promise<boolean> {
        const reader = response.body.getReader();

        let result;
        const output = fs.createWriteStream(destination);
        while (true) {
            result = await reader.read();

            if (result.done) {
                output.close();
                return true;
            }

            output.write(new Buffer(result.value.buffer));
        }
    }
}
