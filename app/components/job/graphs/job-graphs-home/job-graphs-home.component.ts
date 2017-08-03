import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";

import { Job, Task, TaskState } from "app/models";
import { CacheDataService, JobParams, JobService, TaskService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import "./job-graphs-home.scss";

enum AvailableGraph {
    runningTime,
    progress,
}
@Component({
    selector: "bl-job-graphs-home",
    templateUrl: "job-graphs-home.html",
})
export class JobGraphsComponent implements OnInit, OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: params.jobId, label: "Job graphs" };
    }
    public AvailableGraph = AvailableGraph;

    public job: Job;
    public jobId: string;
    public tasks: List<Task> = List([]);
    public loading = false;
    public currentGraph = AvailableGraph.runningTime;
    public description: string;

    private _data: RxEntityProxy<JobParams, Job>;

    constructor(
        private route: ActivatedRoute,
        private taskService: TaskService,
        private jobService: JobService,
        private cacheDataService: CacheDataService,
    ) {

        this._data = this.jobService.get(null, {});
        this._data.item.subscribe((job) => {
            this.job = job;
        });
        this._updateDescription();
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.jobId = params["jobId"];
            this._data.params = { id: this.jobId };
            this._data.fetch();
            this.updateTasks();
        });
    }

    public async updateTasks() {
        console.time("update-task");
        this.loading = true;

        const success = await this._tryLoadTasksFromCache();
        if (success) {
            this.loading = false;
            return;
        }
        this.taskService.listAll(this.jobId, {
            select: "id,executionInfo",
            filter: FilterBuilder.prop("state").eq(TaskState.completed).toOData(),
            pageSize: 1000,
        }).subscribe({
            next: (tasks) => {
                console.log("Got all tasks", tasks.size);
                console.timeEnd("update-task");
                console.time("update-data");

                this.loading = false;
                this.tasks = tasks;
                this.cacheDataService.cache(this._cacheKey, tasks.toJS());
                console.timeEnd("update-data");

            },
            error: (error) => {
                log.error(`Error retrieving all tasks for job ${this.job.id}`, error);
            },
        });
    }

    public ngOnDestroy() {
        this._data.dispose();
    }

    public updateGraph(newGraph: AvailableGraph) {
        this.currentGraph = newGraph;
        this._updateDescription();
    }

    private _updateDescription() {
        switch (this.currentGraph) {
            case AvailableGraph.runningTime:
                this.description = "Shows the running time of each completed" +
                    "tasks in this job(Each point represent a task).";
                break;
            case AvailableGraph.progress:
                this.description = "Shows the time taken to start(and end) n number of tasks.";
                break;
            default:
                this.description = "Unkown graph type.";
        }
    }

    private get _cacheKey() {
        return `/jobs-graphs/${this.jobId}/tasks`;
    }

    private async _tryLoadTasksFromCache() {
        const data = await this.cacheDataService.read(this._cacheKey);
        if (data) {
            this.tasks = List(data.map(x => new Task(x)));
            return true;
        }
        return false;
    }
}
