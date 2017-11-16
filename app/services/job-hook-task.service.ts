import { Injectable } from "@angular/core";

import { JobHookTask } from "app/models";
import { BatchClientService } from "./batch-client.service";
import { BatchListGetter, ListOptionsAttributes, ListView, TargetedDataCache } from "./core";
import { ServiceBase } from "./service-base";

export interface JobHookTaskListParams {
    jobId?: string;
}

@Injectable()
export class JobHookTaskService extends ServiceBase {
    private _cache = new TargetedDataCache<JobHookTaskListParams, JobHookTask>({
        key: ({ jobId }) => jobId,
    }, "nodeUrl");

    private _listGetter: BatchListGetter<JobHookTask, JobHookTaskListParams>;

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._listGetter = new BatchListGetter(JobHookTask, this.batchService, {
            cache: ({ jobId }) => this._cache.getCache({ jobId }),
            list: (client, { jobId }, options) => {
                return client.job.listPreparationAndReleaseTaskStatus(jobId, { taskListSubtasksOptions: options });
            },
            listNext: (client, nextLink: string) => {
                return client.job.listPreparationAndReleaseTaskStatusNext(nextLink);
            },
        });
    }

    public list(options: ListOptionsAttributes = {}): ListView<JobHookTask, JobHookTaskListParams> {
        return new ListView({
            cache: ({ jobId }) => this._cache.getCache({ jobId }),
            getter: this._listGetter,
            initialOptions: options,
        });
    }
}
