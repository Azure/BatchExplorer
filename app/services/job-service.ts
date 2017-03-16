import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Job } from "app/models";
import { log } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, getOnceProxy } from "./core";
import { ServiceBase } from "./service-base";

export interface JobParams {
    id?: string;
}

@Injectable()
export class JobService extends ServiceBase {
    /**
     * Triggered only when a job is added through this app.
     * Used to notify the list of a new item
     */
    public onJobAdded = new Subject<string>();

    private _basicProperties: string = "id,displayName,state,creationTime,poolInfo";
    private _cache = new DataCache<Job>();

    constructor(batchService: BatchClientService) {
        super(batchService);
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(initialOptions: any = {}): RxListProxy<{}, Job> {
        return new RxBatchListProxy<{}, Job>(Job, this.batchService, {
            cache: () => this._cache,
            proxyConstructor: (client, params, options) => client.job.list(options),
            initialOptions,
        });
    }

    public get(jobId: string, options: any = {}): RxEntityProxy<JobParams, Job> {
        return new RxBatchEntityProxy(Job, this.batchService, {
            cache: () => this._cache,
            getFn: (client, params: JobParams) => {
                return client.job.get(params.id, options);
            },
            initialParams: { id: jobId },
        });
    }

    public getOnce(jobId: string, options: any = {}): Observable<Job> {
        return getOnceProxy(this.get(jobId, options));
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

    public add(job: any, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.job.add(job, options));
    }
}
