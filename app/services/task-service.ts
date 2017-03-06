import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";

import { SubtaskInformation, Task } from "app/models";
import { log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import BatchClient from "../api/batch/batch-client";
import {
    DataCache,
    RxBatchEntityProxy,
    RxBatchListProxy,
    RxEntityProxy,
    RxListProxy,
    TargetedDataCache,
    getOnceProxy,
} from "./core";
import { CommonListOptions, ServiceBase } from "./service-base";

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

export interface TaskListOptions extends CommonListOptions {
}

@Injectable()
export class TaskService extends ServiceBase {
    /**
     * Notify the list of a new item being added
     */
    public onTaskAdded = new Subject<TaskParams>();

    private _basicProperties: string = "id,state,dependsOn";
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

    public list(initialJobId: string, initialOptions: TaskListOptions = {}): RxListProxy<TaskListParams, Task> {
        return new RxBatchListProxy<TaskListParams, Task>(Task, {
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

        return new RxBatchListProxy<SubtaskListParams, SubtaskInformation>(SubtaskInformation, {
            cache: ({jobId, taskId}) => this._subTaskCache.getCache({ jobId, taskId }),
            proxyConstructor: ({jobId, taskId}, options) => {
                return BatchClient.task.listSubtasks(jobId, taskId, options);
            },
            initialParams: { jobId: initialJobId, taskId: initialTaskId },
            initialOptions,
        });
    }

    public get(initialJobId: string, taskId: string, options: any = {}): RxEntityProxy<TaskParams, Task> {
        return new RxBatchEntityProxy(Task, {
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

    /**
     * Get multiple tasks for the specified id's.
     * @param jobId: for this jobId
     * @param taskIds: get tasks mathing these id's
     * @param properties: optional OData select properties
     */
    public getMultiple(jobId: string, taskIds: string[], properties?: string): Observable<List<Task>> {
        let options: TaskListOptions = {
            filter: FilterBuilder.or(...taskIds.map(id => FilterBuilder.prop("id").eq(id))).toOData(),
            maxResults: taskIds.length,
        };

        if (properties) {
            options.select = properties;
        }

        const data = this.list(jobId, options);
        return data.fetchAll().cascade(() => {
            return data.items.first();
        });
    }

    public terminate(jobId: string, taskId: string, options: any): Observable<{}> {
        return this.callBatchClient(BatchClient.task.terminate(jobId, taskId, options));
    }

    /**
     * Starts the deletion process
     */
    public delete(jobId: string, taskId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient(BatchClient.task.delete(jobId, taskId, options), (error) => {
            log.error(`Error deleting task: ${taskId}, for job: ${jobId}`, error);
        });
    }

    public add(jobId: string, task: any, options: any): Observable<{}> {
        return this.callBatchClient(BatchClient.task.add(jobId, task, options));
    }

    /**
     * Reactivate a task
     * https://msdn.microsoft.com/en-us/library/azure/mt742660.aspx?f=255&MSPPError=-2147217396
     */
    public reactivate(jobId: string, taskId: string, options: any = {}): Observable<{}> {
        return this.callBatchClient(BatchClient.task.reactivate(jobId, taskId, options), (error) => {
            log.error(`Error reactivating task: ${taskId}, for job: ${jobId}`, error);
        });
    }
}
