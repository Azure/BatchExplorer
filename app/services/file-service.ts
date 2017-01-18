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

export interface FileParams {
    poolId?: string;
    nodeId?: string;

    jobId?: string;
    taskId?: string;

    filename?: string;
}

export interface FileContentResult {
    content: string;
    result: any;
}

@Injectable()
export class FileService extends ServiceBase {
    private _basicProperties: string = "name, url";
    private _cache = new DataCache<File>("url");

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public listFromComputeNode(
        initialPoolId: string,
        initialNodeId: string,
        recursive = true,
        initialOptions: any = {}): RxListProxy<NodeFileListParams, File> {

        return new RxBatchListProxy<NodeFileListParams, File>(File, {
            cache: (params) => this._cache,
            proxyConstructor: (params, options) => {
                return BatchClient.file.listFromComputeNode(params.poolId, params.nodeId, recursive, options);
            },
            initialParams: { poolId: initialPoolId, nodeId: initialNodeId },
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

    // public listFromTask(
    //     jobId: string,
    //     taskId: string,
    //     recursive = true,
    //     initialOptions: any = {}): RxListProxy<File> {

    //     return new RxListProxy<File>(File, this._cache, (options) => {
    //         return BatchClient.file.listFromTask(jobId, taskId, recursive, options);
    //     }, initialOptions)​;
    // }

    // public getFromComputeNode(poolId: string, nodeId: string, options: any): RxEntityProxy<FileParams, Node> {
    //     return new RxEntityProxy(Node, this._cache, (params: FileParams) => {
    //         return BatchClient.node.get(params.poolId, params.id, options);
    //     }, { id: nodeId, poolId });
    // }

    // public getFromTask(jobId: string, taskId: string, options: any): RxEntityProxy<FileParams, Node> {
    //     return new RxEntityProxy(File, this._cache, (params: FileParams) => {
    //         return BatchClient.node.get(params.poolId, params.id, options);
    //     }, { id: nodeId, poolId });
    // }
}
