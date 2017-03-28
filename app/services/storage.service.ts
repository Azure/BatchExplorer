import { Injectable } from "@angular/core";
import * as storage from "azure-storage";
// import { Observable } from "rxjs";

import { File } from "app/models";
import { Constants } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import { DataCache, TargetedDataCache } from "./core";
import { ServiceBase } from "./service-base";

export interface BlobListParams {
    jobId?: string;
    taskId?: string;
}

export interface BlobFileParams extends BlobListParams {
    filename: string;
}

// List of error we don't want to log for files
const fileIgnoredErrors = [
    Constants.HttpCode.NotFound,
    Constants.HttpCode.Conflict,
];

@Injectable()
export class StorageService extends ServiceBase {
    private _blobFileCache = new TargetedDataCache<BlobListParams, File>({
        key: ({ jobId, taskId }) => jobId + "/" + taskId,
    }, "url");

    constructor(batchService: BatchClientService) {
        super(batchService);
    }

    public getBlobCache(params: BlobListParams): DataCache<File> {
        return this._blobFileCache.getCache(params);
    }

    public listBlobsForTask(jobIdParam: string, taskIdParam: string, initialOptions: any = {}): any {
        // const blobSvc = storage.createBlobService(
        //     "andrew1973",
        //     "TrQHCI9J3+U/4mbKQU6k0wLGIbfo/M8J5p9RfWllVSaOyHDMm18Um/hkhEDPDJI2Sl+4cQtfFLCQ0/riQ3102w==",
        // );

        // blobSvc.listBlobsSegmented("job-5f95d414-862e-49b5-816a-15e4ce50860e", null, (error, result, response) => {
        //     if (!error) {
        //         // result.entries contains the entries
        //         // if not all blobs were returned, result.continuationToken has the continuation token.
        //         console.log("*** listBlobsSegmented ***");
        //         console.log(result);
        //     }
        // });

        // return new RxBatchListProxy<TaskFileListParams, File>(File, this.batchService, {
        //     cache: (params) => this.getTaskFileCache(params),
        //     proxyConstructor: (client, params, options) => {
        //         return client.file.listFromTask(params.jobId, params.taskId, recursive, options);
        //     },
        //     initialParams: { jobId: initialJobId, taskId: initialTaskId },
        //     initialOptions,
        //     logIgnoreError: fileIgnoredErrors,
        // });

        return {};
    }
}
