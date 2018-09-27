import { Injectable, NgZone } from "@angular/core";
import {
    EntityView,
    HttpCode,
    ListView,
    ServerError,
    TargetedDataCache,
} from "@batch-flask/core";
import { BlobContainer } from "app/models";
import { StorageEntityGetter, StorageListGetter } from "app/services/core";
import { SharedAccessPolicy } from "app/services/storage/models";
import { log } from "@batch-flask/utils";
import { Constants } from "common";
import { Observable, Subject, from, throwError } from "rxjs";
import { catchError, flatMap, map, share } from "rxjs/operators";
import { BlobStorageClientProxy } from "./blob-storage-client-proxy";
import { StorageClientService } from "./storage-client.service";

export interface GetContainerParams {
    storageAccountId: string;
    id: string;
}

export interface ListContainerParams {
    storageAccountId: string;
}

// List of error we don't want to log for storage requests
const storageIgnoredErrors = [
    HttpCode.NotFound,
    HttpCode.Conflict,
];

@Injectable()
export class StorageContainerService {
    /**
     * Triggered only when a file group is added through this app.
     * Used to notify the list of a new item
     */
    public onContainerAdded = new Subject<string>();
    public onContainerUpdated = new Subject();

    private _containerGetter: StorageEntityGetter<BlobContainer, GetContainerParams>;
    private _containerListGetter: StorageListGetter<BlobContainer, ListContainerParams>;
    private _containerCache = new TargetedDataCache<ListContainerParams, BlobContainer>({
        key: ({ storageAccountId }) => storageAccountId,
    }, "id");

    constructor(
        private storageClient: StorageClientService,
        private zone: NgZone) {

        this._containerGetter = new StorageEntityGetter(BlobContainer, this.storageClient, {
            cache: params => this._containerCache.getCache(params),
            getFn: async (client, params: GetContainerParams) => {
                const response = await client.getContainerProperties(params.id);
                response.data.storageAccountId = params.storageAccountId;
                return response;
            },
        });
        this._containerListGetter = new StorageListGetter(BlobContainer, this.storageClient, {
            cache: params => this._containerCache.getCache(params),
            getData: async (client, params, options, continuationToken) => {
                let prefix = null;
                if (options && options.filter) {
                    prefix = options.filter.value;
                }
                const response = await client.listContainersWithPrefix(
                    prefix,
                    continuationToken,
                    { maxResults: options && options.maxResults });

                response.data.map(x => x.storageAccountId = params.storageAccountId);
                return response;
            },
            logIgnoreError: storageIgnoredErrors,
        });
    }

    /**
     * Get a particular container
     * @param storageAccountId - Storage account id
     * @param container - Name of the blob container
     * @param options - Optional parameters for the request
     */
    public get(storageAccountId: string, container: string, options: any = {}): Observable<BlobContainer> {
        return this._containerGetter.fetch({ storageAccountId, id: container });
    }

    /**
     * Get a particular container from the linked storage account
     * @param storageAccountId - Storage account id
     * @param container - Name of the blob container
     */
    public getFromCache(storageAccountId: string, container: string): Observable<BlobContainer> {
        return this._containerGetter.fetch({ storageAccountId, id: container }, { cached: true });
    }

    public listView(): ListView<BlobContainer, ListContainerParams> {
        const view = new ListView({
            cache: params => this._containerCache.getCache(params),
            getter: this._containerListGetter,
        });
        return view;
    }

    /**
     * Create an entity view for a container
     */
    public view(): EntityView<BlobContainer, GetContainerParams> {
        return new EntityView({
            cache: params => this._containerCache.getCache(params),
            getter: this._containerGetter,
            poll: Constants.PollRate.entity,
        });
    }

    public generateSharedAccessUrl(
        storageAccountId: string,
        container: string,
        sharedAccessPolicy: SharedAccessPolicy): Observable<string> {
        return this._callStorageClient(storageAccountId, (client) => {
            const sasToken = client.generateSharedAccessSignature(container, null, sharedAccessPolicy);
            return Promise.resolve(client.getUrl(container, null, sasToken));
        }, (error) => {
            log.error(`Error generating container SAS: ${container}`, { ...error });
        });
    }

    public create(storageAccountId: string, containerName: string): Observable<any> {
        return this._callStorageClient(storageAccountId, (client) => {
            return client.createContainer(containerName);
        }, (error) => {
            log.error(`Error creating container: ${containerName}`, { ...error });
        });
    }

    public createIfNotExists(storageAccountId: string, containerName: string): Observable<any> {
        return this._callStorageClient(storageAccountId, (client) => {
            return client.createContainerIfNotExists(containerName);
        }, (error) => {
            log.error(`Error creating container: ${containerName}`, { ...error });
        });
    }

    /**
     * Marks the specified container for deletion if it exists. The container and any blobs contained
     * within it are later deleted during garbage collection.
     */
    public delete(storageAccountId: string, container: string, options: any = {}): Observable<any> {
        const observable = this._callStorageClient(storageAccountId,
            (client) => client.deleteContainer(container, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error deleting container: " + container, Object.assign({}, error));
            },
        });

        return observable;
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
            flatMap((client) => from<T>(promise(client))),
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

}
