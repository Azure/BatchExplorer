import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { Job, JobHookTask, JobHookTaskResult, JobHookTaskState } from "app/models";
import { JobHookTaskListParams, JobHookTaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { DateUtils } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";

import "./job-hook-task-browser.scss";

type HookTaskType = "preparationTask" | "releaseTask";
const HookTaskType = {
    preparationTask: "preparationTask" as HookTaskType,
    releaseTask: "releaseTask" as HookTaskType,
};

@Component({
    selector: "bl-job-hook-task-browser",
    templateUrl: "job-hook-task-browser.html",
})
export class JobHookTaskBrowserComponent implements OnInit, OnDestroy {
    public HookTaskType = HookTaskType;

    public onlyFailedControl = new FormControl(false);

    @Input()
    public job: Job;

    public data: RxListProxy<JobHookTaskListParams, JobHookTask>;

    public tasks: List<JobHookTask>;
    public pickedTaskId: string;
    public pickedTask: JobHookTask;

    public type: HookTaskType = "preparationTask";
    private _sub: Subscription;

    constructor(jobHookTaskService: JobHookTaskService) {
        this.data = jobHookTaskService.list();
        this.data.items.subscribe((items) => {
            this.tasks = items;
            console.log("Items", items.toJS());
        });

        this._sub = this.onlyFailedControl.valueChanges.subscribe((onlyFailed) => {
            console.log("ONly failed", onlyFailed);
            const filter = FilterBuilder.prop("jobPreparationTaskExecutionInfo/exitCode").ne(0).toOData();
            this.data.patchOptions({
                filter: filter,
            });
            this.data.fetchNext();
        });
    }

    public ngOnInit() {
        this.data.params = { jobId: this.job.id };
        this.data.fetchNext().subscribe(() => console.log("Banana"), (e) => console.error("Ee", e));
    }

    public ngOnDestroy() {
        this.data.dispose();
        this._sub.unsubscribe();
    }

    public formatDate(date: Date) {
        return DateUtils.prettyDate(date, 7);
    }

    public updateType(type) {
        this.type = type;
    }

    public status(task: JobHookTask) {
        const { state, result } = task[this.type];

        if (state === JobHookTaskState.running) {
            return "runnning";
        } else if (result === JobHookTaskResult.success) {
            return "success";
        } else {
            return "failure";
        }
    }

    public pickTask(id: string) {
        this.pickedTaskId = id;
        this.pickedTask = this.tasks.filter(x => x.id === id).first();
        console.log("pick a task", id, this.pickedTask, this.tasks.map(x => x.id).toArray());
    }
    public get hasReleasedTask() {
        return Boolean(this.job.jobReleaseTask);
    }
}
