import { Injectable } from "@angular/core";

import BatchClient from "../api/batch/batch-client";
import { File } from "../models";
import { DataCache, RxListProxy } from "./core";
import ServiceBase from "./service-base";

export interface NodeFileListParams {
    poolId?: string;
    nodeId?: string;
}

export interface TaskFileListParams {
    jobId?: string;
    taskId?: string;
}

@Injectable()
export class FileService extends ServiceBase {
    private _basicProperties: string = "name, url";
    private _nodeFilecache = new DataCache<File>("url");
    private _taskFileCache = new DataCache<File>("url");

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public listFromComputeNode(
        initialPoolId: string,
        initialNodeId: string,
        recursive = true,
        initialOptions: any = {}): RxListProxy<NodeFileListParams, File> {

        return new RxListProxy<NodeFileListParams, File>(File, {
            cache: (params) => this._nodeFilecache,
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
            initialOptions,
        })​;
    }

    public listFromTask(
        initialJobId: string,
        initialTaskId: string,
        recursive = true,
        initialOptions: any = {}): RxListProxy<TaskFileListParams, File> {

        return new RxListProxy<TaskFileListParams, File>(File, {
            cache: (params) => this._taskFileCache,
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromTask(params.jobId, params.taskId, recursive, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
        })​;
    }
}
