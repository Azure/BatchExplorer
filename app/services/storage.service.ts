import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { File, ServerError } from "app/models";
import { Constants, StorageUtils, log } from "app/utils";
import { DataCache, RxListProxy, RxStorageListProxy, TargetedDataCache } from "./core";
import { StorageClientService } from "./storage-client.service";

export interface BlobListParams {
    jobId?: string;
    taskId?: string;
    outputKind?: string;
}

// List of error we don't want to log for files
const fileIgnoredErrors = [
    Constants.HttpCode.NotFound,
    Constants.HttpCode.Conflict,
];

@Injectable()
export class StorageService {
    private _taskFileCache = new TargetedDataCache<BlobListParams, File>({
        key: ({ jobId, taskId, outputKind }) => jobId + "/" + taskId + "/" + outputKind,
    }, "url");

    constructor(private storageService: StorageClientService) {
    }

    public getBlobFileCache(params: BlobListParams): DataCache<File> {
        return this._taskFileCache.getCache(params);
    }

    /**
     * List blobs in the linked storage account that match the container name and prefix
     * @param jobIdParam - The ID of the job that will be turned into a safe container name
     * @param taskIdParam - The ID of the task, this will be the initial prefix of the blob path
     * @param outputKindParam - taskId subfolder name for the type of file: '$TaskOutput' or '$TaskLog'
     */
    public listBlobsForTask(jobIdParam: string, taskIdParam: string, outputKindParam: string):
        RxListProxy<BlobListParams, File> {

        const initialOptions: any = {};
        return new RxStorageListProxy<BlobListParams, File>(File, this.storageService, {
            cache: (params) => this.getBlobFileCache(params),
            proxyConstructor: (client, params, options) => {
                // The filter prefix of the blob. eg: 10011/$TaskOutput/name-starts-with
                let blobPrefixFilter = `${params.taskId}/${params.outputKind}`;
                if (options.filter) {
                    blobPrefixFilter += this._getBlobNameFilter(options.filter);
                }

                // NOTE: the null parameter is for the continuationToken, dont know what to do with that just yet.
                return StorageUtils.getSafeContainerName(params.jobId).then((safeContainerName) => {
                    return client.listBlobsWithPrefix(safeContainerName, blobPrefixFilter, null, initialOptions);
                });
            },
            initialParams: { jobId: jobIdParam, taskId: taskIdParam, outputKind: outputKindParam},
            initialOptions,
            logIgnoreError: fileIgnoredErrors,
        });
    }

    /**
     * Get the filter text. It will be in the OData format: startswith(name, 'filtertext')
     * Note, we could change the filter to just return the filter string rather than the
     * OData filter string.
     */
    private _getBlobNameFilter(filter: any): string {
        const filterMatch = /startswith\(name,\s*'([^']*)'\)/.exec(filter);
        if (filterMatch && filterMatch.length >= 1) {
            return `/${filterMatch[1]}`;
        }

        return null;
    }
}
