import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";

import { JobSchedule } from "app/models";
import { JobScheduleCreateDto, JobSchedulePatchDto } from "app/models/dtos";
import { Constants, ModelUtils, log } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, BatchListGetter, ContinuationToken,
    DataCache, EntityView, ListOptionsAttributes, ListView,
} from "./core";
import { ServiceBase } from "./service-base";

export interface JobScheduleListParams {
}

export interface JobScheduleParams {
    id?: string;
}

export interface JobScheduleListOptions extends ListOptionsAttributes {
}

@Injectable()
export class JobScheduleService extends ServiceBase {
    /**
     * Triggered only when a job schedule is added through this app.
     * Used to notify the list of a new item
     */
    public onJobScheduleAdded = new Subject<string>();
    public cache = new DataCache<JobSchedule>();

    private _basicProperties: string = "id,displayName,state,creationTime";
    private _getter: BatchEntityGetter<JobSchedule, JobScheduleParams>;
    private _listGetter: BatchListGetter<JobSchedule, JobScheduleListParams>;

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(JobSchedule, this.batchService, {
            cache: () => this.cache,
            getFn: (client, params: JobScheduleParams) => client.jobSchedule.get(params.id),
        });

        this._listGetter = new BatchListGetter(JobSchedule, this.batchService, {
            cache: () => this.cache,
            list: (client, params: JobScheduleListParams, options) => {
                return client.jobSchedule.list({ jobListOptions: options });
            },
            listNext: (client, nextLink: string) => client.jobSchedule.listNext(nextLink),
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options?: any, forceNew?: boolean);
    public list(nextLink: ContinuationToken);
    public list(nextLinkOrOptions: any, options = {}, forceNew = false) {
        if (nextLinkOrOptions.nextLink) {
            return this._listGetter.fetch(nextLinkOrOptions);
        } else {
            return this._listGetter.fetch({}, options, forceNew);
        }
    }

    public listView(options: ListOptionsAttributes = {}): ListView<JobSchedule, JobScheduleListParams> {
        return new ListView({
            cache: () => this.cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAll(options: JobScheduleListOptions = {}): Observable<List<JobSchedule>> {
        return this._listGetter.fetchAll({}, options);
    }

    public get(jobId: string, options: any = {}): Observable<JobSchedule> {
        return this._getter.fetch({ id: jobId });
    }

    /**
     * Create an entity view for a job schedule
     */
    public view(): EntityView<JobSchedule, JobScheduleParams> {
        return new EntityView({
            cache: () => this.cache,
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    public delete(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.delete(jobId, options), (error) => {
            log.error("Error deleting job: " + jobId, error);
        });
    }

    public terminate(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.terminate(jobId, options));
    }

    public disable(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.disable(jobId, options));
    }

    public enable(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.enable(jobId, options));
    }

    public add(job: JobScheduleCreateDto, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.add(job.toJS(), options));
    }

    public patch(jobId: string, attributes: JobSchedulePatchDto, options: any = {}) {
        return this.callBatchClient((client) => client.jobSchedule.patch(jobId, options));
    }

    public updateTags(job: JobSchedule, tags: List<string>) {
        const attributes = new JobSchedulePatchDto({
            metadata: ModelUtils.updateMetadataWithTags(job.metadata, tags),
        });
        return this.patch(job.id, attributes);
    }
}
