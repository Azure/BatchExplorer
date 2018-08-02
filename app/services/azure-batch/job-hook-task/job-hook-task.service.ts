import { Injectable } from "@angular/core";

import { JobHookTask } from "app/models";
import { ListOptionsAttributes, ListView, TargetedDataCache } from "@batch-flask/core";
import { AzureBatchHttpService, BatchListGetter } from "../core";

export interface JobHookTaskListParams {
    jobId?: string;
}

@Injectable()
export class JobHookTaskService {
    private _cache = new TargetedDataCache<JobHookTaskListParams, JobHookTask>({
        key: ({ jobId }) => jobId,
    }, "nodeUrl");

    private _listGetter: BatchListGetter<JobHookTask, JobHookTaskListParams>;

    constructor(private http: AzureBatchHttpService) {

        this._listGetter = new BatchListGetter(JobHookTask, this.http, {
            cache: ({ jobId }) => this._cache.getCache({ jobId }),
            uri: ({ jobId }) => `/jobs/${jobId}/jobpreparationandreleasetaskstatus`,
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
