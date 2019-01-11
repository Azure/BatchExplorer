import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FilterBuilder, ListView } from "@batch-flask/core";
import { Job, JobHookTask, JobHookTaskState } from "app/models";
import { TaskExecutionResult } from "app/models/azure-batch";
import { JobHookTaskListParams, JobHookTaskService } from "app/services";
import { List } from "immutable";
import { Subscription } from "rxjs";

import "./job-hook-task-browser.scss";

enum HookTaskType {
    PreparationTask = "preparationTask",
    ReleaseTask = "releaseTask",
}

@Component({
    selector: "bl-job-hook-task-browser",
    templateUrl: "job-hook-task-browser.html",
})
export class JobHookTaskBrowserComponent implements OnDestroy, OnChanges {
    public HookTaskType = HookTaskType;

    public onlyFailedControl = new FormControl(false);

    @Input()
    public job: Job;

    public data: ListView<JobHookTask, JobHookTaskListParams>;

    public tasks: List<JobHookTask>;
    public displayItems: any[];
    public pickedTaskId: string;
    public pickedTask: JobHookTask;

    public type: HookTaskType = HookTaskType.PreparationTask;
    private _sub: Subscription;

    constructor(jobHookTaskService: JobHookTaskService) {
        this.data = jobHookTaskService.list();
        this.data.items.subscribe((items) => {
            this.tasks = items;
            this._computeDisplayItems();
        });

        this._sub = this.onlyFailedControl.valueChanges.subscribe((onlyFailed) => {
            const filter = FilterBuilder.prop("jobPreparationTaskExecutionInfo/exitCode").ne(0);
            this.data.patchOptions({
                filter: filter,
            });
            this.data.fetchNext();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.job) {
            const { previousValue, currentValue } = changes.job;
            if (previousValue && currentValue && previousValue.id === currentValue.id) {
                return;
            }
            this.data.params = { jobId: this.job.id };
            this.data.refresh();
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._sub.unsubscribe();
    }

    public updateType(type) {
        if (type === HookTaskType.ReleaseTask && !this.hasReleaseTask) {
            return;
        }
        this.type = type;
        this._computeDisplayItems();
    }

    public status(task: JobHookTask) {
        const info = task[this.type];

        if (!info) {
            return "waiting";
        }
        const { state, result } = info;

        if (state === JobHookTaskState.Running) {
            return "runnning";
        } else if (result === TaskExecutionResult.Success) {
            return "success";
        } else {
            return "failure";
        }
    }

    public pickTask(id: string) {
        this.pickedTaskId = id;
        this.pickedTask = this.tasks.filter(x => x.id === id).first();
    }

    public get hasReleaseTask() {
        return Boolean(this.job.jobReleaseTask);
    }

    public trackTask(_: number, task: any) {
        return task.id;
    }

    private _computeDisplayItems() {
        this.displayItems = this.tasks.map((task) => {
            const info = task[this.type];
            return {
                id: task.id,
                nodeId: task.nodeId,
                status: this.status(task),
                startTime: info && info.startTime,
                endTime: info && info.endTime,
                exitCode: info && info.exitCode,
            };
        }).toArray();
    }
}
