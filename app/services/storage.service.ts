import { Injectable, NgZone } from "@angular/core";
import * as storage from "azure-storage";
import { AsyncSubject, Observable, Subject } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { BlobContainer, File, ServerError } from "app/models";
import { FileSystemService } from "app/services";
import { Constants, log } from "app/utils";
import {
    DataCache,
    RxEntityProxy,
    RxListProxy,
    RxStorageEntityProxy,
    RxStorageListProxy,
    TargetedDataCache,
    getOnceProxy,
} from "./core";
import { FileLoadOptions, FileLoader, FileNavigator, FileSource } from "./file";
import { ListBlobOptions } from "./storage";
import { StorageClientService } from "./storage-client.service";

export interface ListBlobParams {
    container?: string;
}

export interface GetContainerParams {
    id: string;
}

export interface ListContainerParams {
    prefix?: string;
}

export interface BlobFileParams extends ListBlobParams {
    blobPrefix?: string;
    blobName?: string;
}

export interface BlobContentResult {
    content: string;
}

export interface NavigateBlobsOptions {
    /**
     * Optional callback that gets called when an error is returned listing files.
     * You can that way ignore the error or modify it.
     */
    onError?: (error: ServerError) => ServerError;
}
// List of error we don't want to log for storage requests
const storageIgnoredErrors = [
    Constants.HttpCode.NotFound,
    Constants.HttpCode.Conflict,
];

// Regex to extract the host, container and blob from a sasUrl
const storageBlobUrlRegex = /^(https:\/\/[\w\._\-]+)\/([\w\-_]+)\/([\w\-_.]+)\?(.*)$/i;

@Injectable()
export class StorageService {
    /**
     * Triggered only when a file group is added through this app.
     * Used to notify the list of a new item
     */
    public onFileGroupAdded = new Subject<string>();
    public onFileGroupUpdated = new Subject();
    public ncjFileGroupPrefix: string = "fgrp-";
    public maxBlobPageSize: number = 100; // 500 slows down the UI too much.
    public maxContainerPageSize: number = 50;

    private _containerCache = new DataCache<BlobContainer>();
    private _blobListCache = new TargetedDataCache<ListBlobParams, File>({
        key: ({ container }) => container,
    }, "name");

    constructor(
        private storageClient: StorageClientService,
        private backgroundTaskService: BackgroundTaskService,
        private fs: FileSystemService,
        private zone: NgZone) { }

    public getBlobFileCache(params: ListBlobParams): DataCache<File> {
        return this._blobListCache.getCache(params);
    }

    /**
     * List blobs in the linked storage account container that match the supplied prefix and filter
     * @param container - Promise to return the name of the blob container
     * @param options - Options for filtering blobs
     */
    public listBlobs(
        container: string,
        options: ListBlobOptions = {})
        : RxListProxy<ListBlobParams, File> {

        const initialOptions: any = { maxResults: this.maxBlobPageSize, recursive: false, ...options };
        return new RxStorageListProxy<ListBlobParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getData: (client, params, options, continuationToken) => {
                return client.listBlobs(
                    params.container,
                    options,
                    continuationToken,
                );
            },
            initialParams: { container: container },
            initialOptions,
            logIgnoreError: storageIgnoredErrors,
        });
    }

    /**
     * Create a blob files naviagotor to be used in a tree view.
     * @param container Azure storage container id
     * @param prefix Prefix to make the root of the tree
     * @param options List options
     */
    public navigateContainerBlobs(container: string, prefix?: string, options: NavigateBlobsOptions = {}) {
        return new FileNavigator({
            cache: this.getBlobFileCache({ container: container }),
            basePath: prefix,
            loadPath: (folder) => {
                return this.listBlobs(container, {
                    recursive: false,
                    startswith: folder,
                });
            },
            getFile: (filename: string) => this.getBlobContent(container, filename),
            onError: options.onError,
        });
    }

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     * @param container - Id of the blob container
     * @param blobName - Name of the blob, not including prefix
     * @param blobPrefix - Optional prefix of the blob, i.e. {container}/{blobPrefix}+{blobName}
     */
    public getBlobProperties(container: string, blobName: string, blobPrefix?: string)
        : RxEntityProxy<BlobFileParams, File> {

        const initialOptions: any = {};
        return new RxStorageEntityProxy<BlobFileParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getFn: (client, params) => {
                return client.getBlobProperties(params.container, params.blobName, params.blobPrefix, initialOptions);
            },
            initialParams: {
                container: container,
                blobPrefix: blobPrefix,
                blobName: blobName,
            },
            logIgnoreError: storageIgnoredErrors,
        });
    }

    /**
     * Downloads a blob into a text string.
     * @param container - Id of the blob container
     * @param blobName - Name of the blob, not including prefix
     * @param blobPrefix - Optional prefix of the blob, i.e. {container}/{blobPrefix}+{blobName}
     */
    public getBlobContent(container: string, blobName: string, blobPrefix?: string): FileLoader {
        return new FileLoader({
            filename: blobName,
            source: FileSource.blob,
            groupId: blobPrefix,
            fs: this.fs,
            properties: () => {
                return this.getBlobProperties(container, blobName, blobPrefix);
            },
            content: (options: FileLoadOptions) => {
                return this._callStorageClient((client) => {
                    const pathToBlob = `${blobPrefix || ""}${blobName}`;
                    return client.getBlobContent(container, pathToBlob, options);
                });
            },
            download: (dest: string) => {
                return this._callStorageClient((client) => {
                    const pathToBlob = `${blobPrefix || ""}${blobName}`;
                    return client.getBlobToLocalFile(container, pathToBlob, dest);
                });
            },
        });
    }

    /**
     * Downloads a blob into a text string.
     * @param container - Name of the container
     * @param blobName - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param fileName - The local path to the file to be downloaded.
     * @param options - Optional parameters, rangeStart & rangeEnd for partial contents
     */
    public saveBlobToFile(container: string, blobName: string, fileName: string, options: any = {})
        : Observable<BlobContentResult> {

        return this._callStorageClient((client) => {
            return client.getBlobToLocalFile(container, blobName, fileName, options);
        });
    }

    /**
     * Marks the specified blob for deletion if it exists. The blob is later
     * deleted during garbage collection.
     * @param container - Name of the container
     * @param blobName - Fully prefixed blob path: "1001/$TaskOutput/myblob.txt"
     * @param options - Optional parameters
     */
    public deleteBlobIfExists(container: string, blob: string, options: any = {}): Observable<any> {
        return this._callStorageClient((client) => {
            return client.deleteBlobIfExists(container, blob, options).then((result) => {
                const blobCache = this.getBlobFileCache({ container: container });
                if (result && blobCache) {
                    // cache key is file.name (the name of the blob excluding the container)
                    blobCache.deleteItemByKey(blob);
                }
            });
        });
    }

    /**
     * Delete the list of files from the container in storage
     * @param container - Instance of the container
     * @param files - Files to delete
     * @param options - Optional parameters
     */
    public deleteFilesFromContainer(container: BlobContainer, files: File[], options: any = {}) {
        const fileCount = files.length;
        const taskTitle = `Delete ${fileCount} files from ${container.name}`;

        return this.backgroundTaskService.startTask(taskTitle, (task) => {
            // NOTE: slight pause in-between deletes to ease load on storage account
            const observable = Observable.interval(100).take(fileCount);
            observable.subscribe({
                next: (i) => {
                    return this.deleteBlobIfExists(container.id, files[i].name).subscribe({
                        next: () => {
                            task.name.next(`${taskTitle} (${i + 1}/${fileCount})`);
                            task.progress.next((i + 1) / fileCount * 100);
                        },
                        error: (error) => {
                            log.error("Failed to delete blob", error);
                        },
                    });
                },
                complete: () => {
                    task.progress.next(100);
                },
            });

            return observable;
        });
    }

    /**
     * List containers in the linked storage account that match the optional container name prefix
     * @param prefix - Container name prefix for filtering containers
     * @param onError - Callback for interrogating the server error to see if we want to handle it.
     */
    public listContainers(prefix: string, onError?: (error: ServerError) => boolean)
        : RxListProxy<ListContainerParams, BlobContainer> {

        const initialOptions: any = { maxResults: this.maxContainerPageSize };
        return new RxStorageListProxy<ListContainerParams, BlobContainer>(BlobContainer, this.storageClient, {
            cache: () => this._containerCache,
            getData: (client, params, options, continuationToken) => {
                return client.listContainersWithPrefix(
                    params.prefix,
                    options.filter,
                    continuationToken,
                    initialOptions);
            },
            initialParams: { prefix: prefix },
            initialOptions,
            logIgnoreError: storageIgnoredErrors,
            onError: onError,
        });
    }

    /**
     * Get a particular container from the linked storage account
     * @param container - Name of the blob container
     * @param options - Optional parameters for the request
     */
    public getContainerProperties(container: string, options: any = {})
        : RxEntityProxy<GetContainerParams, BlobContainer> {

        return new RxStorageEntityProxy<GetContainerParams, BlobContainer>(BlobContainer, this.storageClient, {
            cache: () => this._containerCache,
            getFn: (client, params) => {
                return client.getContainerProperties(params.id, this.ncjFileGroupPrefix, options);
            },
            initialParams: { id: container },
            logIgnoreError: storageIgnoredErrors,
        });
    }

    public getContainerOnce(container: string, options: any = {}): Observable<BlobContainer> {
        return getOnceProxy(this.getContainerProperties(container, options));
    }

    /**
     * Marks the specified container for deletion if it exists. The container and any blobs contained
     * within it are later deleted during garbage collection.
     */
    public deleteContainer(container: string, options: any = {}): Observable<any> {
        let observable = this._callStorageClient((client) => client.deleteContainer(container, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error deleting container: " + container, Object.assign({}, error));
            },
        });

        return observable;
    }

    public uploadToSasUrl(sasUrl: string, filePath: string): Observable<any> {
        const subject = new AsyncSubject<storage.BlobService.BlobResult>();

        const { accountUrl, sasToken, container, blob } = this._parseSasUrl(sasUrl);
        const service = storage.createBlobServiceWithSas(accountUrl, sasToken);
        service.createBlockBlobFromLocalFile(container, blob, filePath,
            (error: any, result: storage.BlobService.BlobResult) => {
                this.zone.run(() => {

                    if (error) {
                        subject.error(ServerError.fromStorage(error));
                        subject.complete();
                    }
                    subject.next(result);
                    subject.complete();
                });
            });

        return subject.asObservable();
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
     * Return the container name from a file group name
     * @param fileGroupName Name of the file group
     */
    public fileGroupContainer(fileGroupName: string) {
        return `${this.ncjFileGroupPrefix}${fileGroupName}`;
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

    private _parseSasUrl(sasUrl: string) {
        const match = storageBlobUrlRegex.exec(sasUrl);

        if (match.length < 5) {
            throw new Error(`Invalid sas url "${sasUrl}"`);
        }

        return {
            accountUrl: match[1],
            container: match[2],
            blob: match[3],
            sasToken: match[4],
        };
    }
}
