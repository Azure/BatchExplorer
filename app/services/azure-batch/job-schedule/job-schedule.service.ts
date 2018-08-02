import { Injectable } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListView,
} from "@batch-flask/core";
import { JobSchedule } from "app/models";
import { JobScheduleCreateDto, JobSchedulePatchDto } from "app/models/dtos";
import { Constants, ModelUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";
import { AzureBatchHttpService, BatchEntityGetter, BatchListGetter } from "../core";

export interface JobScheduleListParams {
}

export interface JobScheduleParams {
    id?: string;
}

export interface JobScheduleListOptions extends ListOptionsAttributes {
}

@Injectable()
export class JobScheduleService {
    /**
     * Triggered only when a job schedule is added through this app.
     * Used to notify the list of a new item
     */
    public onJobScheduleAdded = new Subject<string>();
    public cache = new DataCache<JobSchedule>();

    private _basicProperties: string = "id,displayName,state,creationTime";
    private _getter: BatchEntityGetter<JobSchedule, JobScheduleParams>;
    private _listGetter: BatchListGetter<JobSchedule, JobScheduleListParams>;

    constructor(private http: AzureBatchHttpService) {

        this._getter = new BatchEntityGetter(JobSchedule, this.http, {
            cache: () => this.cache,
            uri: (params: JobScheduleParams) => `/jobschedules/${params.id}`,
        });

        this._listGetter = new BatchListGetter(JobSchedule, this.http, {
            cache: () => this.cache,
            uri: () => `/jobschedules`,

        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options?: any, forceNew?: boolean);
    public list(nextLink: ContinuationToken);
    public list(nextLinkOrOptions: any, options = {}, forceNew = false) {
        if (nextLinkOrOptions && nextLinkOrOptions.nextLink) {
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

    public get(jobScheduleId: string, options: any = {}): Observable<JobSchedule> {
        return this._getter.fetch({ id: jobScheduleId });
    }

    public getFromCache(jobScheduleId: string, options: any = {}): Observable<JobSchedule> {
        return this._getter.fetch({ id: jobScheduleId }, { cached: true });
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

    public delete(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.http.delete(`/jobschedules/${jobScheduleId}`);
    }

    public terminate(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobschedules/${jobScheduleId}/terminate`, null);
    }

    public disable(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobschedules/${jobScheduleId}/disable`, null);
    }

    public enable(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobschedules/${jobScheduleId}/enable`, null);
    }

    public add(jobSchedule: JobScheduleCreateDto, options: any = {}): Observable<{}> {
        return this.http.post(`/jobschedules`, jobSchedule.toJS());
    }

    public patch(jobScheduleId: string, attributes: JobSchedulePatchDto, options: any = {}) {
        return this.http.patch(`/jobschedules/${jobScheduleId}`, attributes.toJS());
    }

    public updateTags(jobSchedule: JobSchedule, tags: List<string>) {
        const attributes = new JobSchedulePatchDto({
            metadata: ModelUtils.updateMetadataWithTags(jobSchedule.metadata, tags),
        });
        return this.patch(jobSchedule.id, attributes);
    }
}
