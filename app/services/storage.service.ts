import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

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
import { FileLoadOptions, FileLoader, FileSource } from "./file";
import { StorageClientService } from "./storage-client.service";

export interface ListBlobParams {
    container?: Promise<string>;
    blobPrefix?: string;
}

export interface GetContainerParams {
    id: string;
}

export interface ListContainerParams {
    prefix?: string;
}

export interface BlobFileParams extends ListBlobParams {
    blobName?: string;
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
        key: ({ container, blobPrefix }) => container + "/" + blobPrefix,
    }, "url");

    constructor(private storageClient: StorageClientService, private fs: FileSystemService) {
    }

    public getBlobFileCache(params: ListBlobParams): DataCache<File> {
        return this._blobListCache.getCache(params);
    }

    /**
     * List blobs in the linked storage account container that match the supplied prefix and filter
     * @param container - Promise to return the name of the blob container
     * @param blobPrefix - Optional prefix usesd for filtering blobs
     * @param onError - Callback for interrogating the server error to see if we want to handle it.
     */
    public listBlobs(container: Promise<string>, blobPrefix?: string, onError?: (error: ServerError) => boolean)
        : RxListProxy<ListBlobParams, File> {

        const initialOptions: any = { maxResults: this.maxBlobPageSize };
        return new RxStorageListProxy<ListBlobParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getData: (client, params, options, continuationToken) => {
                return params.container.then((containerName) => {
                    return client.listBlobsWithPrefix(
                        containerName,
                        params.blobPrefix,
                        options.filter,
                        continuationToken,
                        initialOptions);
                });
            },
            initialParams: { container: container, blobPrefix: blobPrefix },
            initialOptions,
            logIgnoreError: storageIgnoredErrors,
            onError: onError,
        });
    }

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     * @param container - Promise to return the name of the blob container
     * @param blobName - Name of the blob, not including prefix
     * @param blobPrefix - Optional prefix of the blob, i.e. {container}/{blobPrefix}+{blobName}
     */
    public getBlobProperties(container: Promise<string>, blobName: string, blobPrefix?: string)
        : RxEntityProxy<BlobFileParams, File> {

        const initialOptions: any = {};
        return new RxStorageEntityProxy<BlobFileParams, File>(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getFn: (client, params) => {
                return params.container.then((containerName) => {
                    return client.getBlobProperties(containerName, params.blobName, params.blobPrefix, initialOptions);
                });
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
     * @param container - Promise to return the name of the blob container
     * @param blobName - Name of the blob, not including prefix
     * @param blobPrefix - Optional prefix of the blob, i.e. {container}/{blobPrefix}+{blobName}
     */
    public getBlobContent(container: Promise<string>, blobName: string, blobPrefix?: string): FileLoader {
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
                    return container.then((containerName) => {
                        return client.getBlobContent(containerName, pathToBlob, options);
                    });
                });
            },
            download: (dest: string) => {
                return this._callStorageClient((client) => {
                    return container.then((containerName) => {
                        const pathToBlob = `${blobPrefix || ""}${blobName}`;
                        return client.getBlobToLocalFile(containerName, pathToBlob, dest);
                    });
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
