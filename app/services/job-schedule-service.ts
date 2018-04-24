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
                return client.jobSchedule.list({ jobScheduleListOptions: options });
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
        return this.callBatchClient((client) => client.jobSchedule.delete(jobScheduleId, options), (error) => {
            log.error("Error deleting job schedule: " + jobScheduleId, error);
        });
    }

    public terminate(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.terminate(jobScheduleId, options));
    }

    public disable(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.disable(jobScheduleId, options));
    }

    public enable(jobScheduleId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.enable(jobScheduleId, options));
    }

    public add(jobSchedule: JobScheduleCreateDto, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.jobSchedule.add(jobSchedule.toJS(), options));
    }

    public patch(jobScheduleId: string, attributes: JobSchedulePatchDto, options: any = {}) {
        return this.callBatchClient((client) => {
            return client.jobSchedule.patch(jobScheduleId, attributes.toJS(), options);
        }, (error) => {
            log.error(`Error patching job schedule: ${jobScheduleId}`, error);
        });
    }

    public updateTags(jobSchedule: JobSchedule, tags: List<string>) {
        const attributes = new JobSchedulePatchDto({
            metadata: ModelUtils.updateMetadataWithTags(jobSchedule.metadata, tags),
        });
        return this.patch(jobSchedule.id, attributes);
    }
}
