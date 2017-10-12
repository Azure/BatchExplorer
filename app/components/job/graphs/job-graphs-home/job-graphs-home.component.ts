import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import * as path from "path";
import { Observable } from "rxjs";

import { tasksToCsv } from "app/components/job/graphs/job-graphs-home/helpers";
import { Job, Task, TaskState } from "app/models";
import { CacheDataService, ElectronShell, FileSystemService, JobParams, JobService, TaskService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { log } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import { autobind } from "core-decorators";
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
        private shell: ElectronShell,
        private fs: FileSystemService,
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
            this.updateTasks().subscribe();
        });
    }

    public updateTasks(force = false): Observable<any> {
        this.loading = true;

        return Observable.fromPromise(this._tryLoadTasksFromCache(force)).flatMap((success) => {
            if (success) {
                this.loading = false;
                return Observable.of(null);
            }
            const obs = this.taskService.listAll(this.jobId, {
                select: "id,executionInfo,nodeInfo",
                filter: FilterBuilder.prop("state").eq(TaskState.completed).toOData(),
                pageSize: 1000,
            });

            obs.subscribe({
                next: (tasks) => {
                    this.loading = false;
                    this.tasks = tasks;
                    this.cacheDataService.cache(this._cacheKey, tasks.toJS());
                },
                error: (error) => {
                    log.error(`Error retrieving all tasks for job ${this.job.id}`, error);
                },
            });
            return obs;

        }).share();
    }

    public ngOnDestroy() {
        this._data.dispose();
    }

    public updateGraph(newGraph: AvailableGraph) {
        this.currentGraph = newGraph;
        this._updateDescription();
    }

    @autobind()
    public refresh() {
        return this.updateTasks(true);
    }

    @autobind()
    public downloadCsv() {
        const csv = tasksToCsv(this.tasks);

        const dest = path.join(this.fs.commonFolders.downloads, `${this.jobId}.csv`);
        return Observable.fromPromise(this.fs.saveFile(dest, csv).then(() => {
            this.shell.showItemInFolder(dest);
        }));
    }

    private _updateDescription() {
        switch (this.currentGraph) {
            case AvailableGraph.runningTime:
                this.description = "Shows the run time of each of the job's completed tasks. " +
                    "Each point represents a completed task. Red point means non-zero exit code.";
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

    private async _tryLoadTasksFromCache(force = false) {
        if (force) {
            return false;
        }
        const data = await this.cacheDataService.read(this._cacheKey);
        if (data) {
            this.tasks = List(data.map(x => new Task(x)));
            return true;
        }
        return false;
    }
}
