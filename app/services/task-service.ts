import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { SubtaskInformation, Task } from "app/models";
import BatchClient from "../api/batch/batch-client";
import { DataCache, RxEntityProxy, RxListProxy, TargetedDataCache, getOnceProxy } from "./core";
import ServiceBase from "./service-base";

export interface TaskListParams {
    jobId?: string;
}

export interface TaskParams extends TaskListParams {
    id?: string;
}

export interface SubtaskListParams {
    jobId?: string;
    taskId?: string;
}

@Injectable()
export class TaskService extends ServiceBase {
    /**
     * Notify the list of a new item being added
     */
    public onTaskAdded = new Subject<TaskParams>();

    private _basicProperties: string = "id,displayName,state";
    private _cache = new TargetedDataCache<TaskListParams, Task>({
        key: ({jobId}) => jobId,
    });

    private _subTaskCache = new TargetedDataCache<SubtaskListParams, SubtaskInformation>({
        key: ({jobId, taskId}) => `${jobId​​​}/${taskId}`,
    });

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public getCache(jobId: string): DataCache<Task> {
        return this._cache.getCache({ jobId });
    }

    public list(initialJobId: string, initialOptions: any = {}): RxListProxy<TaskListParams, Task> {
        return new RxListProxy<TaskListParams, Task>(Task, {
            cache: ({jobId}) => this.getCache(jobId),
            proxyConstructor: ({jobId}, options) => {
                return BatchClient.task.list(jobId, options);
            },
            initialParams: { jobId: initialJobId },
            initialOptions,
        });
    }

    public listSubTasks(
        initialJobId: string,
        initialTaskId: string,
        initialOptions: any = {}): RxListProxy<SubtaskListParams, SubtaskInformation> {

        return new RxListProxy<SubtaskListParams, SubtaskInformation>(SubtaskInformation, {
            cache: ({jobId, taskId}) => this._subTaskCache.getCache({ jobId, taskId }),
            proxyConstructor: ({jobId, taskId}, options) => {
                return BatchClient.task.listSubtasks(jobId, taskId, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
        });
    }

    public get(initialJobId: string, taskId: string, options: any = {}): RxEntityProxy<TaskParams, Task> {
        return new RxEntityProxy(Task, {
            cache: ({jobId}) => this.getCache(jobId),
            getFn: (params: TaskParams) => {
                return BatchClient.task.get(params.jobId, params.id, options);
            },
            initialParams: { id: taskId, jobId: initialJobId },
        });
    }

    public getOnce(jobId: string, taskId: string, options: any = {}): Observable<Task> {
        return getOnceProxy(this.get(jobId, taskId, options));
    }

    public terminate(jobId: string, taskId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.task.terminate(jobId, taskId, options));
    }

    /**
     * Starts the deletion process
     */
    public delete(jobId: string, taskId: string, options: any = {}): Observable<void> {
        const observable = Observable.fromPromise<any>(BatchClient.task.delete(jobId, taskId, options));
        observable.subscribe({
            error: (error) => {
                console.error(`Error deleting task: ${taskId}, for job: ${jobId}`, error);
            },
        });

        return observable;
    }

    public add(jobId: string, task: any, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.task.add(jobId, task, options));
    }
}
