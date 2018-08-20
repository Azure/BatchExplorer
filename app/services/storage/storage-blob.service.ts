import { Injectable, NgZone } from "@angular/core";
import {
    DataCache,
    EntityView,
    HttpCode,
    ListResponse,
    ListView,
    ServerError,
    TargetedDataCache,
} from "@batch-flask/core";
import { File, FileLoadOptions, FileLoader, FileNavigator, FileSystemService } from "@batch-flask/ui";
import { StorageEntityGetter, StorageListGetter } from "app/services/core";
import { SharedAccessPolicy } from "app/services/storage/models";
import { CloudPathUtils, log } from "app/utils";
import { BlobService, createBlobServiceWithSas } from "azure-storage";
import { Constants } from "common";
import { AsyncSubject, Observable, from, of, throwError } from "rxjs";
import { catchError, concat, concatMap, flatMap, map, share, take } from "rxjs/operators";
import { BlobStorageClientProxy, ListBlobOptions } from "./blob-storage-client-proxy";
import { StorageClientService } from "./storage-client.service";

export interface ListBlobParams {
    storageAccountId: string;
    container?: string;
}

export interface BlobFileParams extends ListBlobParams {
    storageAccountId: string;
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

    /**
     * Optional blob name wildcard filter.
     */
    wildcards?: string;

    /**
     * Tell the navigator to fetch all files.
     */
    fetchAll?: boolean;
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
export class StorageBlobService {
    public maxBlobPageSize: number = 100; // 500 slows down the UI too much.
    public maxContainerPageSize: number = 50;

    private _blobListCache = new TargetedDataCache<ListBlobParams, File>({
        key: ({ storageAccountId, container }) => `${storageAccountId}/${container}`,
    }, "name");

    private _blobGetter: StorageEntityGetter<File, BlobFileParams>;

    private _blobListGetter: StorageListGetter<File, ListBlobParams>;

    constructor(
        private storageClient: StorageClientService,
        private fs: FileSystemService,
        private zone: NgZone) {

        this._blobGetter = new StorageEntityGetter(File, this.storageClient, {
            cache: (params) => this.getBlobFileCache(params),
            getFn: (client, params: BlobFileParams) =>
                client.getBlobProperties(params.container, params.blobName, params.blobPrefix),
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

    public listView(storageAccountId: string, container: string, options: ListBlobOptions = {})
        : ListView<File, ListBlobParams> {

        const view = new ListView({
            cache: (params) => this.getBlobFileCache(params),
            getter: this._blobListGetter,
            initialOptions: options,
        });
        view.params = { storageAccountId, container };
        return view;
    }

    public list(
        storageAccountId: string,
        container: string,
        options: ListBlobOptions = {},
        forceNew = false): Observable<ListResponse<File>> {
        return this._blobListGetter.fetch({ storageAccountId, container }, options, forceNew);
    }

    /**
     * Create a blob files naviagotor to be used in a tree view.
     * @param container Azure storage container id
     * @param prefix Prefix to make the root of the tree
     * @param options List options
     */
    public navigate(storageAccountId, container: string, prefix?: string, options: NavigateBlobsOptions = {}) {
        return new FileNavigator({
            cache: this.getBlobFileCache({ storageAccountId, container: container }),
            basePath: prefix,
            params: { storageAccountId, container },
            getter: this._blobListGetter,
            getFile: (filename: string) => this.getBlobContent(storageAccountId, container, filename),
            delete: (filename: string) => this.deleteBlobIfExists(storageAccountId, container, filename),
            onError: options.onError,
            wildcards: options.wildcards,
            fetchAll: options.fetchAll,
        });
    }

    /**
     * Returns all user-defined metadata, standard HTTP properties, and system
     * properties for the blob.
     * @param container - Id of the blob container
     * @param blobName - Name of the blob, not including prefix
     * @param blobPrefix - Optional prefix of the blob, i.e. {container}/{blobPrefix}+{blobName}
     */
    public get(storageAccountId: string, container: string, blobName: string, blobPrefix?: string): Observable<File> {
        return this._blobGetter.fetch({ storageAccountId, container, blobName, blobPrefix });
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
    public getBlobContent(
        storageAccountId: string,
        container: string,
        blobName: string,
        blobPrefix?: string): FileLoader {

        return new FileLoader({
            filename: blobName,
            source: "blob",
            groupId: blobPrefix,
            fs: this.fs,
            properties: () => {
                return this.get(storageAccountId, container, blobName, blobPrefix);
            },
            content: (options: FileLoadOptions) => {
                return this._callStorageClient(storageAccountId, (client) => {
                    const pathToBlob = `${blobPrefix || ""}${blobName}`;
                    return client.getBlobContent(container, pathToBlob, options);
                });
            },
            download: (dest: string) => {
                return this._callStorageClient(storageAccountId, (client) => {
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
    public saveBlobToFile(
        storageAccountId: string,
        container: string,
        blobName: string,
        fileName: string, options: any = {})
        : Observable<BlobContentResult> {

        return this._callStorageClient(storageAccountId, (client) => {
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
    public deleteBlobIfExists(
        storageAccountId: string,
        container: string,
        blob: string,
        options: any = {}): Observable<any> {

        return this._callStorageClient(storageAccountId, (client) => {
            return client.deleteBlobIfExists(container, blob, options).then((result) => {
                const blobCache = this.getBlobFileCache({ storageAccountId, container: container });
                if (result && blobCache) {
                    // cache key is file.name (the name of the blob excluding the container)
                    blobCache.deleteItemByKey(blob);
                }
            });
        });
    }

    public generateSharedAccessBlobUrl(
        storageAccountId: string,
        container: string, blob: string,
        sharedAccessPolicy: SharedAccessPolicy): Observable<string> {

        return this._callStorageClient(storageAccountId, (client) => {
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
    public uploadFile(
        storageAccountId: string,
        container: string,
        file: string,
        remotePath: string): Observable<BlobService.BlobResult> {

        return this._callStorageClient(storageAccountId,
            (client) => client.uploadFile(container, file, remotePath), (error) => {
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
    public uploadFiles(
        storageAccountId: string,
        container: string,
        files: FileUpload[],
        remotePath?: string): Observable<BulkUploadStatus> {

        const total = files.length;
        return from(files).pipe(
            concatMap((file, index) => {
                const status: BulkUploadStatus = {
                    uploaded: index,
                    total,
                    current: file,
                };
                const blob = remotePath ? CloudPathUtils.join(remotePath, file.remotePath) : file.remotePath;
                const uploadObs = this.uploadFile(storageAccountId, container, file.localPath, blob).pipe(
                    map(x => ({
                        uploaded: index + 1,
                        total,
                        current: file,
                    })),
                );
                return of(status).pipe(concat(uploadObs));
            }),
            share(),
        );
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
     * Helper function to call an action on the storage client library. Will handle converting
     * any Storage error to a ServerError.
     * @param promise Promise returned by the batch client
     * @param  errorCallback Optional error callback if want to log
     */
    private _callStorageClient<T>(
        storageAccountId: string,
        promise: (client: BlobStorageClientProxy) => Promise<any>,
        errorCallback?: (error: any) => void): Observable<T> {

        return this.storageClient.getFor(storageAccountId).pipe(
            take(1),
            flatMap((client) => {
                return from<T>(promise(client));
            }),
            catchError((err) => {
                const serverError = ServerError.fromStorage(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return throwError(serverError);
            }),
            map((x) => this.zone.run(() => x)),
            share(),
        );
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
