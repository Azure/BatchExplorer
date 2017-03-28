import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { File } from "app/models";
import { Constants } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, TargetedDataCache } from "./core";
import { ServiceBase } from "./service-base";

export interface BlobListParams {
    jobId?: string;
    taskId?: string;
}

export interface TaskFileParams extends BlobListParams {
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

    public listTaskBlobs(jobIdParam: string, taskIdParam: string, initialOptions: any = {}): any {
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
