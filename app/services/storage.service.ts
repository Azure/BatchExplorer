import { Injectable, NgZone } from "@angular/core";
import { AsyncSubject, Observable, Subject } from "rxjs";

import { HttpCode, ServerError } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { BlobContainer, File } from "app/models";
import { SharedAccessPolicy } from "app/services/storage/models";
import { CloudPathUtils, log } from "app/utils";
import { BlobService, createBlobServiceWithSas } from "azure-storage";
import { Constants } from "common";
import {
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    StorageEntityGetter,
    StorageListGetter,
    TargetedDataCache,
} from "./core";
import { FileLoadOptions, FileLoader, FileNavigator, FileSource } from "./file";
import { FileSystemService } from "./fs.service";
import { BlobStorageClientProxy, ListBlobOptions } from "./storage";
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

export interface FileUpload {
    localPath: string;
    remotePath: string;
}

// List of error we don't want to log for storage requests
const storageIgnoredErrors = [
    HttpCode.NotFound,
    HttpCode.Conflict,
];

export interface BulkUploadStatus {
    uploaded: number;
    total: number;
    current: FileUpload;
}

// Regex to extract the host, container and blob from a sasUrl
const storageBlobUrlRegex = /^(https:\/\/[\w\._\-]+)\/([\w\-_]+)\/([\w\-_.]+)\?(.*)$/i;

@Injectable()
export class StorageService {
    /**
     * Triggered only when a file group is added through this app.
     * Used to notify the list of a new item
     */
    public onContainerAdded = new Subject<string>();
    public onContainerUpdated = new Subject();
    public maxBlobPageSize: number = 100; // 500 slows down the UI too much.
    public maxContainerPageSize: number = 50;

    private _containerCache = new DataCache<BlobContainer>();
    private _blobListCache = new TargetedDataCache<ListBlobParams, File>({
        key: ({ container }) => container,
    }, "name");

    private _containerGetter: StorageEntityGetter<BlobContainer, GetContainerParams>;
    private _blobGetter: StorageEntityGetter<File, BlobFileParams>;
    private _containerListGetter: StorageListGetter<BlobContainer, ListContainerParams>;
    private _blobListGetter: StorageListGetter<File, ListBlobParams>;

    constructor(
        private storageClient: StorageClientService,
        private backgroundTaskService: BackgroundTaskService,
        private fs: FileSystemService,
        private zone: NgZone) {

        this._containerGetter = new StorageEntityGetter(BlobContainer, this.storageClient, {
            cache: () => this._containerCache,
            getFn: (client, params: GetContainerParams) =>
                client.getContainerProperties(params.id),
        });

        this._blobGetter = new StorageEntityGetter(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getFn: (client, params: BlobFileParams) =>
                client.getBlobProperties(params.container, params.blobName, params.blobPrefix),
        });

        this._containerListGetter = new StorageListGetter(BlobContainer, this.storageClient, {
            cache: () => this._containerCache,
            getData: (client, params, options, continuationToken) => {
                return client.listContainersWithPrefix(
                    params && params.prefix,
                    options && options.filter,
                    continuationToken,
                    { maxResults: options && options.maxResults });
            },
            logIgnoreError: storageIgnoredErrors,
        });

        this._blobListGetter = new StorageListGetter(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getData: (client, params, options, continuationToken) => {
                return client.listBlobs(
                    params.container,
                    options.original,
                    continuationToken,
                );
            },
            logIgnoreError: storageIgnoredErrors,
        });
    }

    public getBlobFileCache(params: ListBlobParams): DataCache<File> {
        return this._blobListCache.getCache(params);
    }

    public blobListView(container: string, options: ListBlobOptions = {})
        : ListView<File, ListBlobParams> {

        const view = new ListView({
            cache: (params) => this.getBlobFileCache(params),
            getter: this._blobListGetter,
            initialOptions: options,
        });
        view.params = { container };
        return view;
    }

    public listBlobs(
        container: string,
        options: ListBlobOptions = {},
        forceNew = false): Observable<ListResponse<Blob>> {
        return this._blobListGetter.fetch({ container }, options, forceNew);
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
            params: { container },
            getter: this._blobListGetter,
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
    public getBlobPropertiesOnce(container: string, blobName: string, blobPrefix?: string): Observable<File> {
        return this._blobGetter.fetch({ container, blobName, blobPrefix });
    }

    public blobView(): EntityView<File, BlobFileParams> {
        return new EntityView({
            cache: (params) => this.getBlobFileCache(params),
            getter: this._blobGetter,
            poll: Constants.PollRate.entity,
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
                return this.getBlobPropertiesOnce(container, blobName, blobPrefix);
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
     * Get a particular container from the linked storage account
     * @param container - Name of the blob container
     * @param options - Optional parameters for the request
     */
    public getContainerOnce(container: string, options: any = {}): Observable<BlobContainer> {
        return this._containerGetter.fetch({ id: container });
    }

    public containerListView(prefix?: string, options: ListOptionsAttributes = {})
        : ListView<BlobContainer, ListContainerParams> {

        const view = new ListView({
            cache: () => this._containerCache,
            getter: this._containerListGetter,
            initialOptions: options,
        });

        view.params = { prefix };
        return view;
    }

    /**
     * Create an entity view for a container
     */
    public containerView(): EntityView<BlobContainer, GetContainerParams> {
        return new EntityView({
            cache: () => this._containerCache,
            getter: this._containerGetter,
            poll: Constants.PollRate.entity,
        });
    }

    /**
     * Marks the specified container for deletion if it exists. The container and any blobs contained
     * within it are later deleted during garbage collection.
     */
    public deleteContainer(container: string, options: any = {}): Observable<any> {
        const observable = this._callStorageClient((client) => client.deleteContainer(container, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error deleting container: " + container, Object.assign({}, error));
            },
        });

        return observable;
    }

    public createContainer(containerName: string): Observable<any> {
        return this._callStorageClient((client) => {
            return client.createContainer(containerName);
        }, (error) => {
            log.error(`Error creating container: ${containerName}`, { ...error });
        });
    }

    public createContainerIfNotExists(containerName: string): Observable<any> {
        return this._callStorageClient((client) => {
            return client.createContainerIfNotExists(containerName);
        }, (error) => {
            log.error(`Error creating container: ${containerName}`, { ...error });
        });
    }

    public generateSharedAccessContainerUrl(container: string, sharedAccessPolicy: SharedAccessPolicy)
        : Observable<string> {
        return this._callStorageClient((client) => {
            const sasToken = client.generateSharedAccessSignature(container, null, sharedAccessPolicy);
            return Promise.resolve(client.getUrl(container, null, sasToken));
        }, (error) => {
            // TODO-Andrew: test that errors are caught
            log.error(`Error generating container SAS: ${container}`, { ...error });
        });
    }

    public generateSharedAccessBlobUrl(
        container: string, blob: string,
        sharedAccessPolicy: SharedAccessPolicy): Observable<string> {

        return this._callStorageClient((client) => {
            const sasToken = client.generateSharedAccessSignature(container, blob, sharedAccessPolicy);
            return Promise.resolve(client.getUrl(container, blob, sasToken));
        }, (error) => {
            // TODO-Andrew: test that errors are caught
            log.error(`Error generating container SAS: ${container}`, { ...error });
        });
    }

    public uploadToSasUrl(sasUrl: string, filePath: string): Observable<any> {
        const subject = new AsyncSubject<BlobService.BlobResult>();

        const { accountUrl, sasToken, container, blob } = this._parseSasUrl(sasUrl);
        const service = createBlobServiceWithSas(accountUrl, sasToken);
        service.createBlockBlobFromLocalFile(container, blob, filePath,
            (error: any, result: BlobService.BlobResult) => {
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
     * Upload a single file to storage.
     * @param container Container Id
     * @param file Absolute path to the local file
     * @param remotePath Blob name
     */
    public uploadFile(container: string, file: string, remotePath: string): Observable<BlobService.BlobResult> {
        return this._callStorageClient((client) => client.uploadFile(container, file, remotePath), (error) => {
            log.error(`Error upload file ${file} to container ${container}`, error);
        });
    }

    /**
     * Uploads the given files to the container. All files will be flatten under the given remotePath.
     *
     * @example uploadFilesToContainer("abc", ["/home/file1.txt", "/home/etc/file2.txt"], "user/files")
     * // Will create 2 blob container
     *  - user/files/file1.txt
     *  - user/files/file2.txt
     * It will override files if exists
     * @param container Container id
     * @param files List of absolute path to the files to upload
     * @param remotePath Optional path on the blob where to put the files.
     */
    public uploadFiles(container: string, files: FileUpload[], remotePath?: string): Observable<BulkUploadStatus> {
        const total = files.length;
        return Observable.from(files).concatMap((file, index) => {
            const status: BulkUploadStatus = {
                uploaded: index,
                total,
                current: file,
            };
            const blob = remotePath ? CloudPathUtils.join(remotePath, file.remotePath) : file.remotePath;
            const uploadObs = this.uploadFile(container, file.localPath, blob).map(x => ({
                uploaded: index + 1,
                total,
                current: file,
            }));
            return Observable.of(status).concat(uploadObs);
        }).share();
    }

    /**
     * Allow access to the hasAutoStorage observable in the base client
     */
    public get hasAutoStorage(): Observable<boolean> {
        return this.storageClient.hasAutoStorage;
    }

    /**
     * Allow access to the hasArmAutoStorage observable in the base client
     */
    public get hasArmAutoStorage(): Observable<boolean> {
        return this.storageClient.hasArmAutoStorage;
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
    public addFileGroupPrefix(fileGroupName: string) {
        return !this.isFileGroup(fileGroupName)
            ? `${Constants.ncjFileGroupPrefix}${fileGroupName}`
            : fileGroupName;
    }

    /**
     * Return the file group name sans prefix from a container name that possibly
     * includes the file group prefix. Ignore if has no prefix.
     * @param containerName Name of the container including prefix
     */
    public removeFileGroupPrefix(containerName: string) {
        return this.isFileGroup(containerName)
            ? containerName.replace(Constants.ncjFileGroupPrefix, "")
            : containerName;
    }

    /**
     * Returns true if the file group starts with the correct prefix
     * @param fileGroup Name of the name to test
     */
    public isFileGroup(fileGroup: string) {
        return fileGroup && fileGroup.startsWith(Constants.ncjFileGroupPrefix);
    }

    /**
     * Helper function to call an action on the storage client library. Will handle converting
     * any Storage error to a ServerError.
     * @param promise Promise returned by the batch client
     * @param  errorCallback Optional error callback if want to log
     */
    private _callStorageClient<T>(
        promise: (client: BlobStorageClientProxy) => Promise<any>,
        errorCallback?: (error: any) => void): Observable<T> {

        return this.storageClient.get().take(1).flatMap((client) => {
            return Observable.fromPromise<T>(promise(client)).catch((err) => {
                const serverError = ServerError.fromStorage(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return Observable.throw(serverError);
            }).map((x) => this.zone.run(() => x));
        }).share();
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
