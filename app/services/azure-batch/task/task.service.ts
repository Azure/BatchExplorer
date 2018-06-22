import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";

import { FilterBuilder } from "@batch-flask/core";
import { SubtaskInformation, Task, TaskState } from "app/models";
import { TaskCreateDto } from "app/models/dtos";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    FetchAllProgressCallback,
    ListOptionsAttributes,
    ListView,
    TargetedDataCache,
} from "app/services/core";
import { Constants, log } from "app/utils";
import {
    AzureBatchHttpService, BatchEntityGetter, BatchListGetter,
} from "../core";

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

export interface TaskListOptions extends ListOptionsAttributes {
}

@Injectable()
export class TaskService {
    /**
     * Notify the list of a new item being added
     */
    public onTaskAdded = new Subject<TaskParams>();

    private _basicProperties: string = "id,state,dependsOn";
    private _cache = new TargetedDataCache<TaskListParams, Task>({
        // dependsOn: {
        //     cache: jobService.cache,
        //     key: (job: Job) => ({jobId: jobId})
        // },
        key: ({ jobId }) => jobId,
    });
    private _getter: BatchEntityGetter<Task, TaskParams>;
    private _listGetter: BatchListGetter<Task, TaskParams>;
    private _subTaskListGetter: BatchListGetter<SubtaskInformation, SubtaskListParams>;

    private _subTaskCache = new TargetedDataCache<SubtaskListParams, SubtaskInformation>({
        key: ({ jobId, taskId }) => `${jobId}/${taskId}`,
    });

    public get basicProperties(): string {
        return this._basicProperties;
    }

    constructor(private http: AzureBatchHttpService) {

        this._getter = new BatchEntityGetter(Task, this.http, {
            cache: ({ jobId }) => this.getCache(jobId),
            uri: (params: TaskParams) => `/jobs/${params.jobId}/tasks/${params.id}`,
        });

        this._listGetter = new BatchListGetter(Task, this.http, {
            cache: ({ jobId }) => this.getCache(jobId),
            uri: (params: TaskListParams) => `/jobs/${params.jobId}/tasks`,
        });

        this._subTaskListGetter = new BatchListGetter(SubtaskInformation, this.http, {
            cache: ({ jobId, taskId }) => this._subTaskCache.getCache({ jobId, taskId }),
            uri: (params: SubtaskListParams) => `/jobs/${params.jobId}/tasks/${params.taskId}/subtasks`,
        });
    }

    public getCache(jobId: string): DataCache<Task> {
        return this._cache.getCache({ jobId });
    }

    public countTasks(jobId: string, state: TaskState): Observable<number> {
        const filter = FilterBuilder.prop("state").eq(state);
        return this.listAll(jobId, { filter, select: "id,state" }).map(tasks => tasks.size).share();
    }

    public list(jobId: string, options?: any, forceNew?: boolean);
    public list(nextLink: ContinuationToken);
    public list(jobIdOrNextLink: any, options = {}, forceNew = false) {
        if (jobIdOrNextLink.nextLink) {
            return this._listGetter.fetch(jobIdOrNextLink);
        } else {
            return this._listGetter.fetch({ jobId: jobIdOrNextLink }, options, forceNew);
        }
    }

    public listView(options: ListOptionsAttributes = {}): ListView<Task, TaskListParams> {
        return new ListView({
            cache: ({ jobId }) => this.getCache(jobId),
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listSubTasksView(options: ListOptionsAttributes = {}): ListView<SubtaskInformation, SubtaskListParams> {
        return new ListView({
            cache: ({ jobId, taskId }) => this._subTaskCache.getCache({ jobId, taskId }),
            getter: this._subTaskListGetter,
            initialOptions: options,
        });
    }

    public listAll(
        jobId: string,
        options: TaskListOptions = {},
        progress?: FetchAllProgressCallback): Observable<List<Task>> {
        return this._listGetter.fetchAll({ jobId }, options, progress);
    }

    public get(jobId: string, taskId: string, options: any = {}): Observable<Task> {
        return this._getter.fetch({ jobId, id: taskId });
    }

    public getFromCache(jobId: string, taskId: string, options: any = {}): Observable<Task> {
        return this._getter.fetch({ jobId, id: taskId }, { cached: true });
    }

    /**
     * Create an entity view for a node
     */
    public view(): EntityView<Task, TaskParams> {
        return new EntityView({
            cache: ({ jobId }) => this.getCache(jobId),
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    /**
     * Get multiple tasks for the specified id's.
     * @param jobId: for this jobId
     * @param taskIds: get tasks mathing these id's
     * @param properties: optional OData select properties
     */
    public getMultiple(jobId: string, taskIds: string[], properties?: string): Observable<List<Task>> {
        const options: TaskListOptions = {
            filter: FilterBuilder.or(...taskIds.map(id => FilterBuilder.prop("id").eq(id))),
            pageSize: taskIds.length,
        };

        if (properties) {
            options.select = properties;
        }

        return this.listAll(jobId, options);
    }

    public terminate(jobId: string, taskId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/tasks/${taskId}/terminate`, null);
    }

    /**
     * Starts the deletion process
     */
    public delete(jobId: string, taskId: string, options: any = {}): Observable<{}> {
        return this.http.delete(`/jobs/${jobId}/tasks/${taskId}`, null);
    }

    public add(jobId: string, task: TaskCreateDto, options: any): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/tasks`, task.toJS());
    }

    /**
     * Reactivate a task
     */
    public reactivate(jobId: string, taskId: string, options: any = {}): Observable<{}> {
        return this.http.post(`/jobs/${jobId}/tasks/${taskId}/reactivate`, null);
    }
}
