import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { Observable } from "rxjs";

import { ListFilterType } from "@batch-flask/ui/advanced-filter";
import { Job, JobTerminateReason, NameValuePair, TaskState } from "app/models";
import { DateUtils } from "app/utils";
import { ODataFields } from "common/constants";

@Component({
    selector: "bl-job-error-display",
    templateUrl: "job-error-display.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobErrorDisplayComponent {
    @Input()
    public job: Job;

    constructor(private router: Router) { }

    public get executionInfo() {
        return this.job && this.job.executionInfo;
    }

    public get failureInfo() {
        const info = this.executionInfo;
        return info && info.failureInfo;
    }

    public get jobFailed() {
        const info = this.executionInfo;
        return info && info.terminateReason === JobTerminateReason.TaskFailed;
    }

    public get jobTimeout() {
        const info = this.executionInfo;
        return info && info.terminateReason === JobTerminateReason.MaxWallClockTimeExpiry;
    }

    public get jobRunningTime() {
        return DateUtils.prettyDuration(this.job.constraints.maxWallClockTime);
    }

    /**
     * Navigate to the task list with the filter set to non zero exit code failed tasks
     */
    @autobind()
    public gotoFailedTask() {
        const filter = {
            [ODataFields.state]: { [TaskState.completed]: true },
            [ODataFields.taskExitCode]: {
                value: "0",
                type: ListFilterType.Exclude,
            },
        };
        this.router.navigate(["/jobs", this.job.id, "tasks"], {
            queryParams: { filter: JSON.stringify(filter) },
        });
        return of(0);
    }

    public trackDetail(index, detail: NameValuePair) {
        return detail.name;
    }
}
