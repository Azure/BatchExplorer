import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { File } from "app/models";
import { Constants } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache } from "./core";
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

    constructor(batchService: BatchClientService) {
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
        initialOptions: any = {}): RxListProxy<NodeFileListParams, File> {
        return new RxBatchListProxy<NodeFileListParams, File>(File, this.batchService, {
            cache: (params) => this.getNodeFileCache(params),
            proxyConstructor: (client, params, options) => {
                return client.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
            initialOptions,
            logIgnoreError: fileIgnoredErrors,
        });
    }

    public getFileContentFromComputeNode(
        poolId: string,
        nodeId: string,
        filename: string,
        options: any = {}): Observable<FileContentResult> {

        return this.callBatchClient((client) => client.file.getComputeNodeFile(poolId, nodeId, filename, options));
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
        initialOptions: any = {}): RxListProxy<TaskFileListParams, File> {
        return new RxBatchListProxy<TaskFileListParams, File>(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            proxyConstructor: (client, params, options) => {
                return client.file.listFromTask(params.jobId, params.taskId, recursive, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
            logIgnoreError: fileIgnoredErrors,
        });
    }

    public getFileContentFromTask(
        jobId: string,
        taskId: string,
        filename: string,
        options: any = {}): Observable<FileContentResult> {

        return this.callBatchClient((client) => client.file.getTaskFile(jobId, taskId, filename, options));
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
