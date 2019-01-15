import { HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    BasicEntityGetter,
    BasicListGetter,
    ContinuationToken,
    DataCache,
    HttpCode,
    HttpRequestOptions,
    ListOptions,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    ServerError,
    TargetedDataCache,
} from "@batch-flask/core";
import { File, FileLoader, FileNavigator } from "@batch-flask/ui";
import { EncodingUtils, exists } from "@batch-flask/utils";
import * as fs from "fs";
import * as path from "path";
import { Observable, from } from "rxjs";
import { flatMap, map, share, switchMap } from "rxjs/operators";
import { AzureBatchHttpService } from "../core";
import { FileSystemService } from "@batch-flask/electron";

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

export interface FileContentOptions {
    rangeStart?: number | null;
    rangeEnd?: number | null;
}

export interface FileContentResult {
    content: string;
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

@Injectable({providedIn: "root"})
export class FileService {
    private _basicProperties: string = "name, url";
    private _nodeFilecache = new TargetedDataCache<NodeFileListParams, File>({
        key: ({ poolId, nodeId }) => poolId + "/" + nodeId,
    }, "name");
    private _taskFileCache = new TargetedDataCache<TaskFileListParams, File>({
        key: ({ jobId, taskId }) => jobId + "/" + taskId,
    }, "name");

    private _taskFileGetter: BasicEntityGetter<File, TaskFileParams>;
    private _nodeFileGetter: BasicEntityGetter<File, NodeFileParams>;
    private _taskFileListGetter: BasicListGetter<File, TaskFileListParams>;
    private _nodeFileListGetter: BasicListGetter<File, NodeFileListParams>;

    constructor(private http: AzureBatchHttpService, private fs: FileSystemService) {
        this._taskFileGetter = new BasicEntityGetter(File, {
            cache: (params) => this.getTaskFileCache(params),
            supplyData: ({ jobId, taskId, name }) => {
                name = encodeURIComponent(name);
                const uri = `/jobs/${jobId}/tasks/${taskId}/files/${name}`;
                return this.http.head(uri, { observe: "response" }).pipe(
                    map((response) => {
                        return this._parseHeadersToFile(response.headers, name);
                    }),
                    share(),
                );
            },
        });

        this._nodeFileGetter = new BasicEntityGetter(File, {
            cache: (params) => this.getNodeFileCache(params),
            supplyData: ({ poolId, nodeId, name }) => {
                name = encodeURIComponent(name);
                const uri = `/pools/${poolId}/nodes/${nodeId}/files/${name}`;
                return this.http.head(uri, { observe: "response" }).pipe(
                    map((response) => {
                        return this._parseHeadersToFile(response.headers, name);
                    }),
                    share(),
                );
            },
        });

        this._taskFileListGetter = new BasicListGetter(File, {
            cache: (params) => this.getTaskFileCache(params),
            supplyData: (params, options, nextLink) => {
                const uri = nextLink || `/jobs/${params.jobId}/tasks/${params.taskId}/files`;
                return this._listFiles(uri, options, nextLink);
            },
            logIgnoreError: fileIgnoredErrors,
        });

        this._nodeFileListGetter = new BasicListGetter(File, {
            cache: (params) => this.getNodeFileCache(params),
            supplyData: (params, options, nextLink) => {
                const uri = nextLink || `/pools/${params.poolId}/nodes/${params.nodeId}/files`;
                return this._listFiles(uri, options, nextLink);
            },
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

    public listFromNode(poolId: string, nodeId: string, options?: ListOptionsAttributes, forceNew?: boolean)
        : Observable<ListResponse<File>>;
    public listFromNode(poolId: string, nodeId: string, nextLink: ContinuationToken)
        : Observable<ListResponse<File>>;
    public listFromNode(nextLinkOrPoolId: any, nodeId: string, options: any, forceNew = false)
        : Observable<ListResponse<File>> {
        if (nextLinkOrPoolId && nextLinkOrPoolId.nextLink) {
            return this._nodeFileListGetter.fetch(nextLinkOrPoolId);
        } else {
            return this._nodeFileListGetter.fetch({ poolId: nextLinkOrPoolId, nodeId }, options, forceNew);
        }
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
            source: "node",
            fs: this.fs,
            properties: () => {
                return this.getFilePropertiesFromComputeNode(poolId, nodeId, filename);
            },
            content: (options) => {
                return this.getComputeNodeFile(poolId, nodeId, filename, options);
            },
            download: (dest: string) => {
                return this.downloadFromNode(poolId, nodeId, filename, dest);
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
            source: "task",
            groupId: path.join(jobId, taskId),
            fs: this.fs,
            properties: () => {
                return this.getFilePropertiesFromTask(jobId, taskId, filename);
            },
            content: (options) => {
                return this.getTaskFile(jobId, taskId, filename, options);
            },
            download: (dest: string) => {
                return this.downloadFromTask(jobId, taskId, filename, dest);
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

    public downloadFromNode(poolId: string, nodeId: string, filename: string, dest: string) {
        return this._download(`/pools/${poolId}/nodes/${nodeId}/files/${filename}`, dest);
    }

    public downloadFromTask(jobId: string, taskId: string, filename: string, dest: string) {
        return this._download(`/jobs/${jobId}/tasks/${taskId}/files/${filename}`, dest);

    }
    public getComputeNodeFile(poolId: string, nodeId: string, filename: string, options?: FileContentOptions) {
        filename = encodeURIComponent(filename);
        return this._getContent(`/pools/${poolId}/nodes/${nodeId}/files/${filename}`, options);
    }

    public getTaskFile(jobId: string, taskId: string, filename: string, options?: FileContentOptions) {
        filename = encodeURIComponent(filename);
        return this._getContent(`/jobs/${jobId}/tasks/${taskId}/files/${filename}`, options);
    }

    private _download(uri: string, dest: string) {
        return this.http.get(uri, { observe: "response", responseType: "blob" }).pipe(
            flatMap((response) => from(this._downloadContent(response, dest))),
            share(),
        );
    }

    private async _downloadContent(response: HttpResponse<Blob>, destination: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const reader = new FileReader();
            const output = fs.createWriteStream(destination);

            reader.onload = () => {
                const buffer = Buffer.from(reader.result as any);
                output.write(buffer);
                output.close();
                resolve(true);
            };

            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsArrayBuffer(response.body as any);
        });
    }

    private _getContent(uri: string, options?: FileContentOptions): Observable<FileContentResult> {
        const httpOptions: HttpRequestOptions<"response", "arraybuffer"> = {
            observe: "response",
            responseType: "arraybuffer",
        };

        if (options) {
            if (exists(options.rangeStart) && exists(options.rangeEnd)) {
                httpOptions.headers = new HttpHeaders()
                    .set("ocp-range", `bytes=${options.rangeStart}-${options.rangeEnd}`);
            }
        }

        return this.http.get(uri, httpOptions).pipe(
            switchMap((response) => from(this._readContent(response))),
            share(),
        );
    }

    private async _readContent(response: HttpResponse<ArrayBuffer>): Promise<FileContentResult> {
        const buffer = response.body;
        if (!buffer) {
            return { content: "" };
        }
        const { encoding } = await EncodingUtils.detectEncodingFromBuffer({
            buffer: Buffer.from(buffer),
            bytesRead: buffer.byteLength,
        });
        return { content: new TextDecoder(encoding || "utf-8").decode(buffer) };
    }

    private _parseHeadersToFile(headers: HttpHeaders, filename: string) {
        const contentLength = parseInt(headers.get("content-length") || "0", 10);
        return {
            name: filename,
            isDirectory: headers.get("ocp-batch-file-isdirectory") === "True",
            url: headers.get("ocp-batch-file-url"),
            properties: {
                contentLength: isNaN(contentLength) ? 0 : contentLength,
                contentType: headers.get("content-type"),
                creationTime: headers.has("ocp-creation-time") ? new Date(headers.get("ocp-creation-time")!) : null,
                lastModified: headers.has("last-modified") ? new Date(headers.get("last-modified")!) : null,
            },
        };
    }

    private _listFiles(uri: string, options: ListOptions | null, nextLink) {
        let httpOptions: HttpRequestOptions | undefined;
        if (nextLink) {
            uri = nextLink;
        } else {
            const query: any = {};
            if (options && options.original.folder) {
                query["$filter"] = `startswith(name, '${options.original.folder}')`;
            }
            if (options && options.original.limit) {
                query["maxresults"] = options.original.limit;
            }
            query.recursive = Boolean(options && options.original.recursive);
            httpOptions = { params: new HttpParams({ fromObject: query }) };
        }
        return this.http.get<any>(uri, httpOptions).pipe(
            map(x => {
                return {
                    data: x.value,
                    nextLink: x["odata.nextLink"],
                };
            }),
        );
    }
}
