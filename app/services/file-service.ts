import { Injectable } from "@angular/core";
import * as path from "path";

import { File, ServerError } from "app/models";
import { Constants, exists } from "app/utils";
import { Observable } from "rxjs";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, BatchListGetter, DataCache, ListOptionsAttributes, ListView, TargetedDataCache,
} from "./core";
import { FileLoader, FileNavigator, FileSource } from "./file";
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

export interface NaviagateNodeFileConfig {
    /**
     * Path to the base folder the navigation should be returned
     */
    basePath?: string;
}

export interface NaviagateTaskFileOptions {
    onError: (error: ServerError) => ServerError;
}

// List of error we don't want to log for files
export const fileIgnoredErrors = [
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

    private _taskFileGetter: BatchEntityGetter<File, TaskFileParams>;
    private _nodeFileGetter: BatchEntityGetter<File, NodeFileParams>;
    private _taskFileListGetter: BatchListGetter<File, TaskFileListParams>;
    private _nodeFileListGetter: BatchListGetter<File, NodeFileListParams>;

    constructor(batchService: BatchClientService, private fs: FileSystemService) {
        super(batchService);

        this._taskFileGetter = new BatchEntityGetter(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            getFn: (client, { jobId, taskId, filename }) =>
                client.file.getTaskFileProperties(jobId, taskId, filename),
        });

        this._nodeFileGetter = new BatchEntityGetter(File, this.batchService, {
            cache: (params) => this.getNodeFileCache(params),
            getFn: (client, { poolId, nodeId, filename }) =>
                client.file.getComputeNodeFileProperties(poolId, nodeId, filename),
        });

        this._taskFileListGetter = new BatchListGetter(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            list: (client, { jobId, taskId }, options) => {
                const batchOptions = { ...options };
                console.log("Options", options);
                if (options.original.folder) {
                    batchOptions.filter = `startswith(name, '${options.original.folder}')`;
                }
                return client.file.listFromTask(jobId, taskId,
                    { recursive: options.original.recursive, fileListFromTaskOptions: batchOptions });
            },
            listNext: (client, nextLink: string) => client.file.listFromTaskNext(nextLink),
            logIgnoreError: fileIgnoredErrors,

        });

        this._nodeFileListGetter = new BatchListGetter(File, this.batchService, {
            cache: (params) => this.getNodeFileCache(params),
            list: (client, { poolId, nodeId }, options) => {
                const batchOptions = { ...options };
                if (options.original.folder) {
                    batchOptions.filter = `startswith(name, '${options.original.folder}')`;
                }
                return client.file.listFromComputeNode(poolId, nodeId,
                    { recursive: options.original.recursive, fileListFromComputeNodeOptions: batchOptions });
            },
            listNext: (client, nextLink: string) => client.file.listFromComputeNodeNext(nextLink),
            logIgnoreError: fileIgnoredErrors,
        });
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

    // public listFromComputeNode(
    //     initialPoolId: string,
    //     initialNodeId: string,
    //     recursive = true,
    //     initialOptions: any = {},
    //     onError?: (error: ServerError) => boolean): RxListProxy<NodeFileListParams, File> {
    //     return new RxBatchListProxy<NodeFileListParams, File>(File, this.batchService, {
    //         cache: (params) => this.getNodeFileCache(params),
    //         proxyConstructor: (client, params, options) => {
    //             const batchOptions = { ...options };
    //             if (options.folder) {
    //                 batchOptions.filter = `startswith(name, '${options.folder}')`;
    //             }
    //             return client.file.listFromComputeNode(params.poolId, params.nodeId, recursive, batchOptions);
    //         },
    //         initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
    //         initialOptions,
    //         logIgnoreError: fileIgnoredErrors,
    //         onError: onError,
    //     });
    // }

    public listFromNodeView(poolId: string, nodeId: string, options: ListOptionsAttributes = {}) {
        const view = new ListView({
            cache: (params) => this.getNodeFileCache(params),
            getter: this._nodeFileListGetter,
            initialOptions: options,
        });
        view.params = { poolId, nodeId };
        return view;
    }

    public listFromTaskView(jobId: string, taskId: string, options: ListOptionsAttributes = {}) {
        const view = new ListView({
            cache: (params) => this.getTaskFileCache(params),
            getter: this._taskFileListGetter,
            initialOptions: options,
        });
        view.params = { jobId, taskId };
        return view;
    }

    public navigateNodeFiles(poolId: string, nodeId: string, config: NaviagateNodeFileConfig = {}) {
        return new FileNavigator({
            basePath: config.basePath,
            loadPath: (folder) => this.listFromNodeView(poolId, nodeId, { recursive: false, folder }),
            getFile: (filename: string) => this.fileFromNode(poolId, nodeId, filename),
        });
    }

    public navigateTaskFile(jobId: string, taskId: string, options: NaviagateTaskFileOptions) {
        return new FileNavigator({
            loadPath: (folder) => this.listFromTaskView(jobId, taskId, { recursive: false, folder }),
            getFile: (filename: string) => this.fileFromTask(jobId, taskId, filename),
            onError: options.onError,
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
                const batchOptions = { fileGetFromComputeNodeOptions: { ocpRange } };
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
        options: any = {}): Observable<File> {
        return this._nodeFileGetter.fetch({ poolId, nodeId, filename });
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
                const batchOptions = { fileGetFromTaskOptions: { ocpRange } };
                return this.callBatchClient((client) => {
                    return client.file.getTaskFile(jobId, taskId, filename, batchOptions);
                });
            },
            logIgnoreError: fileIgnoredErrors,
        });
    }

    public getFilePropertiesFromTask(
        jobId: string,
        taskId: string,
        filename: string,
        options: any = {}): Observable<File> {
        return this._taskFileGetter.fetch({ jobId, taskId, filename });
    }
}
