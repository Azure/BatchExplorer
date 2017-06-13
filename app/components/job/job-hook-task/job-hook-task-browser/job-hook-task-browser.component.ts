import { Component, Input, OnDestroy, OnInit } from "@angular/core";

import { Job, JobHookTask } from "app/models";
import { JobHookTaskListParams, JobHookTaskService } from "app/services";
import { RxListProxy } from "app/services/core";
import { DateUtils } from "app/utils";

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
    @Input()
    public job: Job;

    public data: RxListProxy<JobHookTaskListParams, JobHookTask>;

    public type: HookTaskType = "preparationTask";

    constructor(jobHookTaskService: JobHookTaskService) {
        this.data = jobHookTaskService.list();
        this.data.items.subscribe((items) => {
            console.log("Items", items.toJS());
        });
    }

    public ngOnInit() {
        this.data.params = { jobId: this.job.id };
        this.data.fetchNext().subscribe(() => console.log("Banana"), (e) => console.error("Ee", e));
    }

    public ngOnDestroy() {
        this.data.dispose();
    }

    public formatDate(date: Date) {
        return DateUtils.prettyDate(date, 7);
    }
}
