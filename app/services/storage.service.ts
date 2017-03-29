import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { File, ServerError } from "app/models";
import { StorageUtils, log } from "app/utils";
import { BlobStorageClientProxy } from "client/api";
// import { DataCache, TargetedDataCache } from "./core";
import { StorageClientService } from "./storage-client.service";

// export interface BlobListParams {
//     jobId?: string;
//     taskId?: string;
// }

// export interface BlobFileParams extends BlobListParams {
//     filename: string;
// }

@Injectable()
export class StorageService {
    // TODO: might want a cache if we make a RxStorageListProxy

    constructor(private storageService: StorageClientService) {
    }

    /**
     * List blobs in the linked storage account that match the container name and prefix
     * @param jobIdParam - jobId that will be turned into a safe container name
     * @param prefixParam - The filter prefix of the blob. In our case it is taskId/OutputKind/nameFilter
     *  example: 1001/$TaskOutput, 1001/$TaskLog, 1001/$TaskOutput/filenameprefix
     * @param initialOptions - any other options to pass to the service
     */
    public listBlobsForTask(jobIdParam: string, prefixParam: string): Observable<File[]> {
        const initialOptions: any = {};
        const observable = Observable
            .fromPromise(StorageUtils.getSafeContainerName(jobIdParam))
            .cascade((safeContainerName) => {

            // TODO: result needs to be mapped into File records.
            // Transform here or in the nodeJs client?

            return this._callServiceClient((client: BlobStorageClientProxy) =>
                client.listBlobsWithPrefix(safeContainerName, prefixParam, null, initialOptions), (error) => {
                /**
                 * TODO: 404 error with:
                 * statusCode: 404
                 * code:"ContainerNotFound"
                 * message:"The specified container does not exist.
                 *  ↵RequestId:abb823a6-0001-0024-703f-a8ab78000000
                 *  ↵Time:2017-03-29T03:52:10.8822916Z"
                 * name:"StorageError"
                 */
                // tslint:disable-next-line
                log.error(`Error getting blobs from container: ${safeContainerName}, with prefix: ${prefixParam}`, error);
            });
        });

        return observable;
    }

    /**
     * Testing if i need this or not
     */
    private _callServiceClient<T>(
        promise: (client: any) => Promise<any>,
        errorCallback?: (error: any) => void): Observable<T> {

        return this.storageService.get().flatMap((client) => {
            return Observable.fromPromise<T>(promise(client)).catch((err) => {
                log.error("_callServiceClient error :: ", err);
                const serverError = ServerError.fromBatch(err);
                if (errorCallback) {
                    errorCallback(serverError);
                }

                return Observable.throw(serverError);
            });
        }).share();
    }
}
