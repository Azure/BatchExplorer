import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EntityView, FilterBuilder, autobind } from "@batch-flask/core";
import { ElectronShell, FileSystemService } from "@batch-flask/electron";
import { tasksToCsv } from "app/components/job/graphs/job-graphs-home/helpers";
import { Job, Task, TaskState } from "app/models";
import { CacheDataService, JobParams, JobService, TaskService } from "app/services";
import { List } from "immutable";
import * as path from "path";
import { Observable, Subscription, from, of } from "rxjs";
import { flatMap, share, tap } from "rxjs/operators";
import "./job-graphs-home.scss";

enum AvailableGraph {
    runningTime,
    progress,
}
@Component({
    selector: "bl-job-graphs-home",
    templateUrl: "job-graphs-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    public loadingFromCache = false;
    public currentGraph = AvailableGraph.runningTime;
    public description: string;
    public taskLoadedProgress = 0;
    public taskCount: number;

    private _data: EntityView<Job, JobParams>;
    private _updateTasksSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        private taskService: TaskService,
        private jobService: JobService,
        private cacheDataService: CacheDataService,
        private shell: ElectronShell,
        private fs: FileSystemService,
        private changeDetector: ChangeDetectorRef,
    ) {

        this._data = this.jobService.view();
        this._data.item.subscribe((job) => {
            this.job = job;
            this.changeDetector.markForCheck();
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
        this._updateTaskCount();
    }

    public ngOnDestroy() {
        this._data.dispose();
        if (this._updateTasksSub) {
            this._updateTasksSub.unsubscribe();
        }
    }

    public updateTasks(force = false): Observable<any> {
        if (this._updateTasksSub) {
            this._updateTasksSub.unsubscribe();
        }
        this.loading = true;
        this.changeDetector.markForCheck();

        const obs = from(this._tryLoadTasksFromCache(force)).pipe(
            flatMap((success) => {
                if (success) {
                    this.loading = false;
                    this.changeDetector.markForCheck();

                    return of(null);
                }
                this.taskLoadedProgress = 0;
                this.changeDetector.markForCheck();

                this._updateTaskCount();
                return this._loadAllTasks();

            }),
            share(),
        );
        this._updateTasksSub = obs.subscribe();
        return obs;
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
        return from(this.fs.saveFile(dest, csv).then(() => {
            this.shell.showItemInFolder(dest);
        }));
    }

    private _updateTaskCount() {
        this.jobService.getTaskCounts(this.jobId).subscribe((taskCount) => {
            this.taskCount = taskCount.completed;
            this.changeDetector.markForCheck();
        });
    }

    private _loadAllTasks() {
        return this.taskService.listAll(this.jobId, {
            select: "id,executionInfo,nodeInfo",
            filter: FilterBuilder.prop("state").eq(TaskState.completed),
            pageSize: 1000,
        }, (x) => {
            this.taskLoadedProgress = x;
            this.changeDetector.markForCheck();
        }).pipe(
            tap((tasks) => {
                this.loading = false;
                this.tasks = tasks;
                this.cacheDataService.cache(this._cacheKey, tasks.toJS());
                this.changeDetector.markForCheck();
            }),
        );
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
        this.changeDetector.markForCheck();
    }

    private get _cacheKey() {
        return `/jobs-graphs/${this.jobId}/tasks`;
    }

    private async _tryLoadTasksFromCache(force = false) {
        if (force) {
            return false;
        }
        this.loadingFromCache = true;
        this.changeDetector.markForCheck();

        const data = await this.cacheDataService.read(this._cacheKey);
        if (data) {
            this.tasks = List(data.map(x => new Task(x)));
            this.loadingFromCache = false;
            return true;
        }
        this.loadingFromCache = false;
        this.changeDetector.markForCheck();
        return false;
    }
}
