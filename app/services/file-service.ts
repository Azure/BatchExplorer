import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import { File } from "../models";
import { DataCache, RxBatchListProxy, RxListProxy } from "./core";
import { ServiceBase } from "./service-base";

export interface NodeFileListParams {
    poolId?: string;
    nodeId?: string;
}

export interface TaskFileListParams {
    jobId?: string;
    taskId?: string;
}

export interface FileContentResult {
    content: string;
    result: any;
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

        // orig
        // return new RxListProxy<NodeFileListParams, File>(File, {
        //     cache: (params) => this._nodeFilecache,
        return new RxBatchListProxy<NodeFileListParams, File>(File, {
            // cache: (params) => this._cache,
            cache: (params) => this._nodeFilecache,
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
            initialOptions,
        })​;
    }

    public getFileContentFromComputeNode(
        poolId: string,
        nodeId: string,
        filename: string,
        options: any = {}): Observable<FileContentResult> {

        return Observable.fromPromise(BatchClient.file.getComputeNodeFile(poolId, nodeId, filename, options));
    }

    // TODO change to RxEntityProxy
    public getFilePropertiesFromComputeNode(
        poolId: string,
        nodeId: string,
        filename: string,
        options: any = {}): Observable<File> {

        return Observable.fromPromise(BatchClient.file.getComputeNodeFileProperties(poolId, nodeId, filename, options));
    }

    public listFromTask(
        initialJobId: string,
        initialTaskId: string,
        recursive = true,
        initialOptions: any = {}): RxListProxy<TaskFileListParams, File> {

        return new RxBatchListProxy<TaskFileListParams, File>(File, {
            cache: (params) => this._taskFileCache,
            // proxyConstructor: (params, options) => {
            //     return BatchClient.file.listFromTask(params.jobId, params.taskId, recursive, options);
            // },
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromTask(params.jobId, params.taskId, recursive, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
        })​;
    }

    public getFileContentFromTask(
        jobId: string,
        taskId: string,
        filename: string,
        options: any = {}): Observable<FileContentResult> {

        return Observable.fromPromise(BatchClient.file.getTaskFile(jobId, taskId, filename, options));
    }

    // TODO change to RxEntityProxy
    public getFilePropertiesFromTask(
        jobId: string,
        taskId: string,
        filename: string,
        options: any = {}): Observable<File> {

        return Observable.fromPromise(BatchClient.file.getTaskFileProperties(jobId, taskId, filename, options));
    }
}
