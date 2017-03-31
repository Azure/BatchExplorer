import { Injectable } from "@angular/core";

import { File, ServerError } from "app/models";
import { Constants, StorageUtils, log } from "app/utils";
import { DataCache, RxListProxy, RxStorageListProxy, TargetedDataCache } from "./core";
import { StorageClientService } from "./storage-client.service";

export interface BlobListParams {
    jobId?: string;
    taskId?: string;
    outputKind?: string;
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

    constructor(private storageService: StorageClientService) {
    }

    public getBlobFileCache(params: BlobListParams): DataCache<File> {
        return this._blobListCache.getCache(params);
    }

    /**
     * List blobs in the linked storage account that match the container name and prefix
     * @param jobIdParam - The ID of the job that will be turned into a safe container name
     * @param taskIdParam - The ID of the task, this will be the initial prefix of the blob path
     * @param outputKindParam - taskId subfolder name for the type of file: '$TaskOutput' or '$TaskLog'
     */
    public listBlobsForTask(
        jobIdParam: string,
        taskIdParam: string,
        outputKindParam: string,
        callback?: (error: ServerError) => boolean): RxListProxy<BlobListParams, File> {

        const initialOptions: any = {};
        return new RxStorageListProxy<BlobListParams, File>(File, this.storageService, {
            cache: (params) => this.getBlobFileCache(params),
            proxyConstructor: (client, params, options) => {
                // the prefix of the blob, eg: 10011/$TaskOutput/
                const prefix = `${params.taskId}/${params.outputKind}/`;
                const filter = options.filter ? options.filter : null;

                // NOTE: the null parameter is for the continuationToken, dont know what to do with that just yet.
                return StorageUtils.getSafeContainerName(params.jobId).then((safeContainerName) => {
                    return client.listBlobsWithPrefix(safeContainerName, prefix, filter, null, initialOptions);
                });
            },
            initialParams: { jobId: jobIdParam, taskId: taskIdParam, outputKind: outputKindParam},
            initialOptions,
            logIgnoreError: storageIgnoredErrors,
            errorCallback: callback,
        });
    }
}
