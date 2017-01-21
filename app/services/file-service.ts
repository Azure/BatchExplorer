import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import { File } from "../models";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache } from "./core";
import { ServiceBase } from "./service-base";

export interface NodeFileListParams {
    poolId?: string;
    nodeId?: string;
}

export interface NodeFileParams {
    poolId?: string;
    nodeId?: string;
    filename?: string;
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
    private _nodeFilecache = new TargetedDataCache<NodeFileListParams, File>({
        key: ({poolId, nodeId}) => poolId + "/" + nodeId,
    }, "url");
    private _taskFileCache = new TargetedDataCache<TaskFileListParams, File>({
        key: ({jobId, taskId}) => jobId + "/" + taskId,
    }, "url");

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

        return new RxBatchListProxy<NodeFileListParams, File>(File, {
            cache: (params) => this.getNodeFileCache(params),
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
            initialOptions,
        })​;
    }

    // public get(initialPoolId: string, initialNodeId: string, options: any): RxEntityProxy<NodeParams, Node> {
    //     return new RxBatchEntityProxy<NodeParams, Node>(​​​Node, {
    //         cache: ({poolId}) => this.getCache(poolId),
    //         getFn: (params: NodeParams) => {
    //             return BatchClient.node.get(params.poolId, params.id, options);
    //         },
    //         initialParams: { poolId: initialPoolId },
    //     })​;
    // }


    public getFileContentFromComputeNode(
        poolId: string,
        nodeId: string,
        filename: string,
        options: any = {}): RxEntityProxy<NodeFileParams, File> {
            return new RxBatchEntityProxy<NodeFileParams, File>(File, {
                cache: (params) => this.getNodeFileCache({poolId: params.poolId, nodeId: params.nodeId}),
                getFn: (params) => {
                    return BatchClient.file.getComputeNodeFile(params.poolId, params.nodeId, params.filename, options);
                },
                initialParams: { poolId: poolId, nodeId: nodeId, filename: filename },
            });
    }

    // public getFileContentFromComputeNode(
    //     poolId: string,
    //     nodeId: string,
    //     filename: string,
    //     options: any = {}): Observable<FileContentResult> {

    //     return Observable.fromPromise(BatchClient.file.getComputeNodeFile(poolId, nodeId, filename, options));
    // }

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
            cache: (params) => this.getTaskFileCache(params),
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
