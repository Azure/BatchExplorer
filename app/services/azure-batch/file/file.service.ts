import { Injectable } from "@angular/core";
import { HttpCode, ServerError } from "@batch-flask/core";
import { AutoScaleFormulaEvaluation, File, NameValuePair } from "app/models";
import { FileCreateDto, FileEnableAutoScaleDto, FilePatchDto, FileResizeDto } from "app/models/dtos";
import { FileSystemService } from "app/services";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    TargetedDataCache,
} from "app/services/core";
import { Constants, ModelUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { AzureBatchHttpService, BatchEntityGetter, BatchListGetter } from "../core";

export interface NodeFileListParams {
    poolId?: string;
    nodeId?: string;
}

export interface NodeFileParams extends NodeFileListParams {
    name: string;
}

export interface TaskFileListParams {
    jobId?: string;
    taskId?: string;
}

export interface TaskFileParams extends TaskFileListParams {
    name: string;
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
    HttpCode.NotFound,
    HttpCode.Conflict,
];

@Injectable()
export class FileService {
    private _basicProperties: string = "name, url";
    private _nodeFilecache = new TargetedDataCache<NodeFileListParams, File>({
        key: ({ poolId, nodeId }) => poolId + "/" + nodeId,
    }, "name");
    private _taskFileCache = new TargetedDataCache<TaskFileListParams, File>({
        key: ({ jobId, taskId }) => jobId + "/" + taskId,
    }, "name");

    private _taskFileGetter: BatchEntityGetter<File, TaskFileParams>;
    private _nodeFileGetter: BatchEntityGetter<File, NodeFileParams>;
    private _taskFileListGetter: BatchListGetter<File, TaskFileListParams>;
    private _nodeFileListGetter: BatchListGetter<File, NodeFileListParams>;

    constructor(private http: AzureBatchHttpService, private fs: FileSystemService) {
        this._taskFileGetter = new BatchEntityGetter(File, this.http, {
            cache: (params) => this.getTaskFileCache(params),
            uri: ({ jobId, taskId, name }) => `/jobs/${jobId}/tasks/${taskId}/files/${name}`,
        });

        this._nodeFileGetter = new BatchEntityGetter(File, this.http, {
            cache: (params) => this.getNodeFileCache(params),
            uri: ({ poolId, nodeId, name }) => `/pools/${poolId}/nodes/${nodeId}/files/${name}`,
        });

        this._taskFileListGetter = new BatchListGetter(File, this.batchService, {
            cache: (params) => this.getTaskFileCache(params),
            uri: (params, options) => {
                const batchOptions = { ...options };
                if (options.original.folder) {
                    batchOptions.filter = `startswith(name, '${options.original.folder}')`;
                }
                return  `/jobs/${params}/tasks/${params.taskId}/files`;
            },
            logIgnoreError: fileIgnoredErrors,
        });

        // this._nodeFileListGetter = new BatchListGetter(File, this.batchService, {
        //     cache: (params) => this.getNodeFileCache(params),
        //     list: (client, { poolId, nodeId }, options) => {
        //         const batchOptions = { ...options };
        //         if (options.original.folder) {
        //             batchOptions.filter = `startswith(name, '${options.original.folder}')`;
        //         }
        //         return client.file.listFromComputeNode(poolId, nodeId,
        //             { recursive: options.original.recursive, fileListFromComputeNodeOptions: batchOptions });
        //     },
        //     listNext: (client, nextLink: string) => client.file.listFromComputeNodeNext(nextLink),
        //     logIgnoreError: fileIgnoredErrors,
        // });
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
            params: { poolId, nodeId },
            getter: this._nodeFileListGetter,
            getFile: (filename: string) => this.fileFromNode(poolId, nodeId, filename),
        });
    }

    public navigateTaskFile(jobId: string, taskId: string, options: NaviagateTaskFileOptions) {
        return new FileNavigator({
            params: { jobId, taskId },
            getter: this._taskFileListGetter,
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
            download: (dest: string) => {
                return this.callBatchClient((client) => {
                    return client.file.downloadFromNode(poolId, nodeId, filename, dest);
                });
            },
        });
    }

    public getFilePropertiesFromComputeNode(
        poolId: string,
        nodeId: string,
        name: string,
        options: any = {}): Observable<File> {
        return this._nodeFileGetter.fetch({ poolId, nodeId, name });
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
            download: (dest: string) => {
                return this.callBatchClient((client) => {
                    return client.file.downloadFromTask(jobId, taskId, filename, dest);
                });
            },
            logIgnoreError: fileIgnoredErrors,
        });
    }

    public getFilePropertiesFromTask(
        jobId: string,
        taskId: string,
        name: string,
        options: any = {}): Observable<File> {
        return this._taskFileGetter.fetch({ jobId, taskId, name });
    }
}
