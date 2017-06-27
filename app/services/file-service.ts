import { Injectable } from "@angular/core";
import * as path from "path";

import { File, ServerError } from "app/models";
import { Constants, exists } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import {
    DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache,
} from "./core";
import { FileLoader, FileSource } from "./file";
import { FileSystemService } from "./fs.service";
import { ServiceBase } from "./service-base";

export interface NodeFileListParams {
    poolId?: string;
    nodeId?: string;
}

export interface NodeFileParams extends NodeFileListParams {
    filename: string;
}

export interface TaskFileListParams {
    jobId?: string;
    taskId?: string;
}

export interface TaskFileParams extends TaskFileListParams {
    filename: string;
}

export interface FileContentResult {
    content: string;
    result: any;
}

// List of error we don't want to log for files
const fileIgnoredErrors = [
    Constants.HttpCode.NotFound,
    Constants.HttpCode.Conflict,
];

@Injectable()
export class FileService extends ServiceBase {
    private _basicProperties: string = "name, url";
    private _nodeFilecache = new TargetedDataCache<NodeFileListParams, File>({
        key: ({ poolId, nodeId }) => poolId + "/" + nodeId,
    }, "url");
    private _taskFileCache = new TargetedDataCache<TaskFileListParams, File>({
        key: ({ jobId, taskId }) => jobId + "/" + taskId,
    }, "url");

    constructor(batchService: BatchClientService, private fs: FileSystemService) {
        super(batchService);
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public getNodeFileCache(params: NodeFileListParams): DataCache<File> {
        return this._nodeFilecache.getCache(params);
    }

    public getTaskFileCache(params: TaskFileListParams): DataCache<File> {
        return this._taskFileCache.getCache(params);
    }

    public listFromComputeNode(
        initialPoolId: string,
        initialNodeId: string,
        recursive = true,
        initialOptions: any = {},
        onError?: (error: ServerError) => boolean): RxListProxy<NodeFileListParams, File> {
        return new RxBatchListProxy<NodeFileListParams, File>(File, this.batchService, {
            cache: (params) => this.getNodeFileCache(params),
            proxyConstructor: (client, params, options) => {
                return client.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
            initialOptions,
            logIgnoreError: fileIgnoredErrors,
            onError: onError,
        });
    }

    public fileFromNode(poolId: string, nodeId: string, filename: string): FileLoader {
        return new FileLoader({
            filename: filename,
            source: FileSource.node,
            fs: this.fs,
            properties: () => {
                return this.getFilePropertiesFromComputeNode(poolId, nodeId, filename);
            },
            content: (options) => {
                let ocpRange = "";
                if (exists(options.rangeStart) && exists(options.rangeEnd)) {
                    ocpRange = `bytes=${options.rangeStart}-${options.rangeEnd}`;
                }
                const batchOptions = { fileGetFromTaskOptions: { ocpRange } };
                return this.callBatchClient((client) => {
                    return client.file.getComputeNodeFile(poolId, nodeId, filename, batchOptions);
                });
            },
        });
    }

    public getFilePropertiesFromComputeNode(
        poolId: string,
        nodeId: string,
        filename: string,
        options: any = {}): RxEntityProxy<NodeFileParams, File> {
        return new RxBatchEntityProxy<NodeFileParams, File>(File, this.batchService, {
            cache: (params) => this.getNodeFileCache(params),
            getFn: (client, params) => {
                return client.file.getComputeNodeFileProperties(poolId, nodeId, filename, options);
            },
            initialParams: { poolId: poolId, nodeId: nodeId, filename: filename },
            logIgnoreError: fileIgnoredErrors,
        });
    }

    public listFromTask(
        initialJobId: string,
        initialTaskId: string,
        recursive = true,
        initialOptions: any = {},
        onError?: (error: ServerError) => boolean): RxListProxy<TaskFileListParams, File> {
        return new RxBatchListProxy<TaskFileListParams, File>(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            proxyConstructor: (client, params, options) => {
                return client.file.listFromTask(params.jobId, params.taskId, recursive, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
            logIgnoreError: fileIgnoredErrors,
            onError: onError,
        });
    }

    public fileFromTask(jobId: string, taskId: string, filename: string): FileLoader {
        return new FileLoader({
            filename: filename,
            source: FileSource.task,
            groupId: path.join(jobId, taskId),
            fs: this.fs,
            properties: () => {
                return this.getFilePropertiesFromTask(jobId, taskId, filename);
            },
            content: (options) => {
                let ocpRange = "";
                if (exists(options.rangeStart) && exists(options.rangeEnd)) {
                    ocpRange = `bytes=${options.rangeStart}-${options.rangeEnd}`;
                }
                const batchOptions = { fileGetFromComputeNodeOptions: { ocpRange } };
                return this.callBatchClient((client) => {
                    return client.file.getTaskFile(jobId, taskId, filename, batchOptions);
                });
            },
        });
    }

    public getFilePropertiesFromTask(
        jobId: string,
        taskId: string,
        filename: string,
        options: any = {}): RxEntityProxy<TaskFileParams, File> {
        return new RxBatchEntityProxy<TaskFileParams, File>(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            getFn: (client, params) => {
                return client.file.getTaskFileProperties(jobId, taskId, filename, options);
            },
            initialParams: { jobId: jobId, taskId: taskId, filename: filename },
            logIgnoreError: fileIgnoredErrors,
        });
    }
}
