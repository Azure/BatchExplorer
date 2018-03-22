import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";

import { HttpCode, ServerError } from "@batch-flask/core";
import { BlobContainer } from "app/models";
import {
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListView,
    StorageEntityGetter,
    StorageListGetter,
} from "app/services/core";
import { SharedAccessPolicy } from "app/services/storage/models";
import { log } from "app/utils";
import { Constants } from "common";
import { BlobStorageClientProxy } from "./blob-storage-client-proxy";
import { StorageClientService } from "./storage-client.service";

export interface GetContainerParams {
    storageAccountId: string;
    id: string;
}

export interface ListContainerParams {
    storageAccountId: string;
    prefix?: string;
}

// TODO-TIM check that
// List of error we don't want to log for storage requests
const storageIgnoredErrors = [
    HttpCode.NotFound,
    HttpCode.Conflict,
];

@Injectable()
export class StorageContainerService {
    private _containerGetter: StorageEntityGetter<BlobContainer, GetContainerParams>;
    private _containerListGetter: StorageListGetter<BlobContainer, ListContainerParams>;
    private _containerCache = new DataCache<BlobContainer>();

    constructor(
        private storageClient: StorageClientService,
        private zone: NgZone) {

        this._containerGetter = new StorageEntityGetter(BlobContainer, this.storageClient, {
            cache: () => this._containerCache,
            getFn: (client, params: GetContainerParams) =>
                client.getContainerProperties(params.id),
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
    }

    /**
     * Get a particular container from the linked storage account
     * @param container - Name of the blob container
     * @param options - Optional parameters for the request
     */
    public get(storageAccountId: string, container: string, options: any = {}): Observable<BlobContainer> {
        return this._containerGetter.fetch({ storageAccountId, id: container });
    }

    public listView(storageAccountId: string, prefix?: string, options: ListOptionsAttributes = {})
        : ListView<BlobContainer, ListContainerParams> {

        const view = new ListView({
            cache: () => this._containerCache,
            getter: this._containerListGetter,
            initialOptions: options,
        });

        view.params = { storageAccountId, prefix };
        return view;
    }

    /**
     * Create an entity view for a container
     */
    public view(): EntityView<BlobContainer, GetContainerParams> {
        return new EntityView({
            cache: () => this._containerCache,
            getter: this._containerGetter,
            poll: Constants.PollRate.entity,
        });
    }

    public generateSharedAccessContainerUrl(
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

        return this.storageClient.getFor(storageAccountId).flatMap((client) => {
            return Observable.fromPromise<T>(promise(client)).catch((err) => {
                const serverError = ServerError.fromStorage(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return Observable.throw(serverError);
            }).map((x) => this.zone.run(() => x));
        }).share();
    }

}
