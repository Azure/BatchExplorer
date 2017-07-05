import { Injectable } from "@angular/core";
import * as path from "path";
import { Observable } from "rxjs";

import { File, ServerError } from "app/models";
import { FileSystemService } from "app/services";
import { Constants, StorageUtils } from "app/utils";
import {
    DataCache,
    RxEntityProxy,
    RxListProxy,
    RxStorageEntityProxy,
    RxStorageListProxy,
    TargetedDataCache,
} from "./core";
import { FileLoadOptions, FileLoader, FileSource } from "./file";
import { StorageClientService } from "./storage-client.service";

export interface BlobListParams {
    jobId?: string;
    taskId?: string;
    outputKind?: string;
}

export interface BlobFileParams extends BlobListParams {
    filename?: string;
}

export interface BlobContentResult {
    content: string;
}

// List of error we don't want to log for storage requests
const storageIgnoredErrors = [
    Constants.HttpCode.NotFound,
    Constants.HttpCode.Conflict,
];

@Injectable()
export class StorageService {
    private _blobListCache = new TargetedDataCache<BlobListParams, File>({
        key: ({ jobId, taskId, outputKind }) => jobId + "/" + taskId + "/" + outputKind,
    }, "url");

    constructor(private storageClient: StorageClientService, private fs: FileSystemService) {
    }

    public getBlobFileCache(params: BlobListParams): DataCache<File> {
        return this._blobListCache.getCache(params);
    }

    /**
     * List blobs in the linked storage account that match the container name and prefix
     * @param jobIdParam - The ID of the job that will be turned into a safe container name
     * @param taskIdParam - The ID of the task, this will be the initial prefix of the blob path
     * @param outputKindParam - Subfolder name for the type of file: '$TaskOutput' or '$TaskLog'
     * @param onError - Callback for interrogating the server error to see if we want to handle it.
     */
    public listBlobsForTask(
        jobIdParam: string,
        taskIdParam: string,
        outputKindParam: string,
        onError?: (error: ServerError) => boolean): RxListProxy<BlobListParams, File> {

        const initialOptions: any = {};
        return new RxStorageListProxy<BlobListParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getData: (client, params, options) => {
                // the prefix of the blob, eg: 10011/$TaskOutput/
                const prefix = `${params.taskId}/${params.outputKind}/`;
                const filter = options.filter ? options.filter : null;

                // NOTE: the null parameter is for the continuationToken, dont know what to do with that just yet.
                return StorageUtils.getSafeContainerName(params.jobId).then((safeContainerName) => {
                    return client.listBlobsWithPrefix(safeContainerName, prefix, filter, null, initialOptions);
                });
            },
            initialParams: { jobId: jobIdParam, taskId: taskIdParam, outputKind: outputKindParam },
            initialOptions,
            logIgnoreError: storageIgnoredErrors,
            onError: onError,
        });
    }

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     * @param jobIdParam - The ID of the job that will be turned into a safe container name
     * @param taskIdParam - The ID of the task, this will be the initial prefix of the blob path
     * @param outputKindParam - Subfolder name for the type of file: '$TaskOutput' or '$TaskLog'
     * @param filenameParam - Name of the blob file.
     */
    public getBlobProperties(
        jobIdParam: string,
        taskIdParam: string,
        outputKindParam: string,
        filenameParam: string): RxEntityProxy<BlobFileParams, File> {

        const initialOptions: any = {};
        return new RxStorageEntityProxy<BlobFileParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getFn: (client, params) => {
                const blobPrefix = `${params.taskId}/${params.outputKind}/`;
                return StorageUtils.getSafeContainerName(params.jobId).then((safeContainerName) => {
                    return client.getBlobProperties(safeContainerName, params.filename, blobPrefix, initialOptions);
                });
            },
            initialParams: {
                jobId: jobIdParam,
                taskId: taskIdParam,
                outputKind: outputKindParam,
                filename: filenameParam,
            },
            logIgnoreError: storageIgnoredErrors,
        });
    }

    /**
     * Downloads a blob into a text string.
     * @param jobId - The ID of the job that will be turned into a safe container name
     * @param blobName - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param options - Optional parameters, rangeStart & rangeEnd for partial contents
     */
    public blobContent(jobId: string, taskId: string, outputKind: string, filename: string): FileLoader {
        return new FileLoader({
            filename: filename,
            source: FileSource.blob,
            groupId: path.join(jobId, taskId, outputKind),
            fs: this.fs,
            properties: () => {
                return this.getBlobProperties(jobId, taskId, outputKind, filename);
            },
            content: (options: FileLoadOptions) => {
                return this._callStorageClient((client) => {
                    return StorageUtils.getSafeContainerName(jobId).then((safeContainerName) => {
                        const blobName = `${taskId}/${outputKind}/${filename}`;
                        return client.getBlobContent(safeContainerName, blobName, options);
                    });
                });
            },
            download: (dest: string) => {
                return this._callStorageClient((client) => {
                    return StorageUtils.getSafeContainerName(jobId).then((safeContainerName) => {
                        const blobName = `${taskId}/${outputKind}/${filename}`;
                        return client.getBlobToLocalFile(safeContainerName, blobName, dest);
                    });
                });
            },
        });
    }

    /**
     * Downloads a blob into a text string.
     * @param jobId - The ID of the job that will be turned into a safe container name
     * @param blobName - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param fileName - The local path to the file to be downloaded.
     * @param options - Optional parameters, rangeStart & rangeEnd for partial contents
     */
    public saveBlobToFile(
        jobId: string,
        blobName: string,
        fileName: string,
        options: any = {}): Observable<BlobContentResult> {

        return this._callStorageClient((client) => {
            return StorageUtils.getSafeContainerName(jobId).then((safeContainerName) => {
                return client.getBlobToLocalFile(safeContainerName, blobName, fileName, options);
            });
        });
    }

    /**
     * Allow access to the hasAutoStorage observable in the base client
     */
    public get hasAutoStorage(): Observable<boolean> {
        return this.storageClient.hasAutoStorage;
    }

    /**
     * Allow a component to refresh the access keys
     */
    public clearCurrentStorageKeys(): void {
        this.storageClient.clearCurrentStorageKeys();
    }

    /**
     * Helper function to call an action on the storage client library. Will handle converting
     * any Storage error to a ServerError.
     * @param promise Promise returned by the batch client
     * @param  errorCallback Optional error callback if want to log
     */
    private _callStorageClient<T>(
        promise: (client: any) => Promise<any>,
        errorCallback?: (error: any) => void): Observable<T> {

        return this.storageClient.get().flatMap((client) => {
            return Observable.fromPromise<T>(promise(client)).catch((err) => {
                const serverError = ServerError.fromStorage(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return Observable.throw(serverError);
            });
        });
    }
}
