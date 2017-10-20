import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Job, JobTaskCounts } from "app/models";
import { JobCreateDto, JobPatchDto } from "app/models/dtos";
import { Constants, ModelUtils, log } from "app/utils";
import { List } from "immutable";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, DataCache, EntityView,
    ListOptionsAttributes, RxBatchListProxy, RxListProxy, getAllProxy,
} from "./core";
import { ServiceBase } from "./service-base";

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

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(Job, this.batchService, {
            cache: () => this.cache,
            getFn: (client, params: JobParams) => client.job.get(params.id),
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(initialOptions: JobListOptions = {}): RxListProxy<{}, Job> {
        return new RxBatchListProxy<{}, Job>(Job, this.batchService, {
            cache: () => this.cache,
            proxyConstructor: (client, params, options) => client.job.list(options),
            initialOptions,
        });
    }

    public listAll(options: JobListOptions = {}): Observable<List<Job>> {
        return getAllProxy(this.list(options));
    }

    public getOnce(jobId: string, options: any = {}): Observable<Job> {
        return this._getter.fetch({ id: jobId });
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
        return this.callBatchClient((client) => client.job.disable(jobId, disableTasks, options));
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
