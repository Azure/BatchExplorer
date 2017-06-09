import { Injectable } from "@angular/core";

import {  JobHookTask } from "app/models";
import { BatchClientService } from "./batch-client.service";
import { RxBatchListProxy, RxListProxy, TargetedDataCache } from "./core";
import { ServiceBase } from "./service-base";

export interface JobHookTaskListParams {
    jobId?: string;
}

@Injectable()
export class JobService extends ServiceBase {
    private _cache = new TargetedDataCache<JobHookTaskListParams, JobHookTask>({
        key: ({ jobId }) => jobId,
    });

    constructor(batchService: BatchClientService) {
        super(batchService);
    }

    public list(initialOptions: any = {}): RxListProxy<JobHookTaskListParams, JobHookTask> {
        return new RxBatchListProxy<JobHookTaskListParams, JobHookTask>(JobHookTask, this.batchService, {
            cache: ({ jobId }) => this._cache.getCache({ jobId }),
            proxyConstructor: (client, params, options) => client.job.listHookTasks(options),
            initialOptions,
        });
    }
}
