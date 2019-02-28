import { Injectable } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListResponse,
    ListView,
} from "@batch-flask/core";
import { Job, JobTaskCounts } from "app/models";
import { JobCreateDto, JobPatchDto } from "app/models/dtos";
import { ModelUtils } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";
import { map, share } from "rxjs/operators";
import { AzureBatchHttpService, BatchEntityGetter, BatchListGetter } from "../core";

export interface JobListParams {
}

export interface JobParams {
    id?: string;
}

export interface JobListOptions extends ListOptionsAttributes {
}

@Injectable({providedIn: "root"})
export class JobService {
    /**
     * Triggered only when a job is added through this app.
     * Used to notify the list of a new item
     */
    public onJobAdded = new Subject<string>();
    public cache = new DataCache<Job>();

    private _basicProperties: string = "id,displayName,state,creationTime,poolInfo";
    private _getter: BatchEntityGetter<Job, JobParams>;
    private _listGetter: BatchListGetter<Job, JobListParams>;

    constructor(private http: AzureBatchHttpService) {

        this._getter = new BatchEntityGetter(Job, this.http, {
            cache: () => this.cache,
            uri: (params) => `/jobs/${params.id}`,
        });

        this._listGetter = new BatchListGetter(Job, this.http, {
            cache: () => this.cache,
            uri: (params) => `/jobs`,
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options?: any, forceNew?: boolean): Observable<ListResponse<Job>>;
    public list(nextLink: ContinuationToken): Observable<ListResponse<Job>>;
    public list(nextLinkOrOptions: any, options = {}, forceNew = false): Observable<ListResponse<Job>> {
        if (nextLinkOrOptions && nextLinkOrOptions.nextLink) {
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
        return this.http.delete(`/jobs/${jobId}`);
    }

    public terminate(jobId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/terminate`, null);
    }

    public disable(jobId: string, disableTasks: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/disable`, {
            disableTasks: disableTasks,
        });
    }

    public enable(jobId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/enable`, null);
    }

    public add(job: JobCreateDto, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs`, job.toJS());
    }

    public patch(jobId: string, attributes: JobPatchDto, options: any = {}) {
        return this.http.patch(`/jobs/${jobId}`, attributes.toJS());
    }

    public updateTags(job: Job, tags: List<string>) {
        const attributes = new JobPatchDto({
            metadata: ModelUtils.updateMetadataWithTags(job.metadata, tags) as any,
        });
        return this.patch(job.id, attributes);
    }

    public getTaskCounts(jobId: string): Observable<JobTaskCounts> {
        return this.http.get(`/jobs/${jobId}/taskcounts`).pipe(
            map(data => new JobTaskCounts(data)),
            share(),
        );
    }
}
