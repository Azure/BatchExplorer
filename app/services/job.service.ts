import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Job, JobTaskCounts } from "app/models";
import { JobCreateDto, JobPatchDto } from "app/models/dtos";
import { Constants, ModelUtils, log } from "app/utils";
import { List } from "immutable";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, BatchListGetter, ContinuationToken,
    DataCache, EntityView, ListOptionsAttributes, ListView,
} from "./core";
import { ServiceBase } from "./service-base";

export interface JobListParams {
}

export interface JobParams {
    id?: string;
}

export interface JobListOptions extends ListOptionsAttributes {
}

@Injectable()
export class JobService extends ServiceBase {
    /**
     * Triggered only when a job is added through this app.
     * Used to notify the list of a new item
     */
    public onJobAdded = new Subject<string>();
    public cache = new DataCache<Job>();

    private _basicProperties: string = "id,displayName,state,creationTime,poolInfo";
    private _getter: BatchEntityGetter<Job, JobParams>;
    private _listGetter: BatchListGetter<Job, JobListParams>;

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(Job, this.batchService, {
            cache: () => this.cache,
            getFn: (client, params: JobParams) => client.job.get(params.id),
        });

        this._listGetter = new BatchListGetter(Job, this.batchService, {
            cache: () => this.cache,
            list: (client, params: JobListParams, options) => client.job.list({ jobListOptions: options }),
            listNext: (client, nextLink: string) => client.job.listNext(nextLink),
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

    public listView(options: ListOptionsAttributes = {}): ListView<Job, JobListParams> {
        return new ListView({
            cache: () => this.cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAll(options: JobListOptions = {}): Observable<List<Job>> {
        return this._listGetter.fetchAll({}, options);
    }

    public get(jobId: string, options: any = {}): Observable<Job> {
        return this._getter.fetch({ id: jobId });
    }

    public getFromCache(jobId: string): Observable<Job> {
        return this._getter.fetch({ id: jobId }, { cached: true });
    }

    /**
     * Create an entity view for a job
     */
    public view(): EntityView<Job, JobParams> {
        return new EntityView({
            cache: () => this.cache,
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    /**
     * Starts the deletion process
     */
    public delete(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.delete(jobId, options), (error) => {
            log.error("Error deleting job: " + jobId, error);
        });
    }

    public terminate(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.terminate(jobId, options));
    }

    public disable(jobId: string, disableTasks: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.disable(jobId, {
            disableTasks: disableTasks,
        }, options));
    }

    public enable(jobId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.enable(jobId, options));
    }

    public add(job: JobCreateDto, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.add(job.toJS(), options));
    }

    public patch(jobId: string, attributes: JobPatchDto, options: any = {}) {
        return this.callBatchClient((client) => client.job.patch(jobId, attributes.toJS(), options), (error) => {
            log.error(`Error patching job: ${jobId}`, error);
        });
    }

    public updateTags(job: Job, tags: List<string>) {
        const attributes = new JobPatchDto({
            metadata: ModelUtils.updateMetadataWithTags(job.metadata, tags),
        });
        return this.patch(job.id, attributes);
    }

    public getTaskCounts(jobId: string): Observable<JobTaskCounts> {
        return this.callBatchClient((client) => client.job.getTaskCounts(jobId), (error) => {
            log.error(`Error getting job task counts: ${jobId}`, error);
        }).map(data => new JobTaskCounts(data));
    }
}
