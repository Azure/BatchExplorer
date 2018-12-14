import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { DateUtils } from "@batch-flask/utils";
import { Job, Task, TaskState } from "app/models";

import "./task-timeline.scss";
import { DateTime } from "luxon";

@Component({
    selector: "bl-task-timeline",
    templateUrl: "task-timeline.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTimelineComponent {
    @Input() public task: Task;

    @Input() public job: Job;

    constructor(private router: Router) { }

    public get hasPreparationTask() {
        return Boolean(this.job.jobPreparationTask);
    }

    public get state() {
        return this.task.state;
    }

    public get started() {
        return this.running || this.completed;
    }

    public get active() {
        return this.state === TaskState.active;
    }

    public get preparing() {
        return this.state === TaskState.preparing;
    }

    public get running() {
        return this.state === TaskState.running;
    }

    public get completed() {
        return this.state === TaskState.completed;
    }

    public get preparingTaskFailed(): boolean {
        return this.task.preparationTaskFailed;
    }

    public get creationTime() {
        return DateUtils.prettyDate(this.task.creationTime);
    }

    public get startTime() {
        const info = this.task.executionInfo;
        return DateUtils.prettyDate(info && info.startTime);
    }

    public get endTime() {
        const info = this.task.executionInfo;
        return DateUtils.prettyDate(info && info.endTime);
    }

    public get retryCount() {
        const info = this.task.executionInfo;
        return info && info.retryCount;
    }

    /**
     * Return true if the task timeout is close(10%)
     */
    public get isTaskTimeoutClose() {
        const info = this.task.executionInfo;
        const constraints = this.task.constraints;
        if (!(info && constraints && constraints.maxWallClockTime)) {
            return false;
        }
        const maxTime = constraints.maxWallClockTime.as("milliseconds");
        const runningTime = DateTime.fromJSDate(info.endTime)
            .diff(DateTime.fromJSDate(info.startTime))
            .as("milliseconds");
        const diff = maxTime - runningTime;
        // If less than 10%
        return diff / maxTime < 0.1;
    }

    public get timeoutMessage(): string {
        const maxTime = DateUtils.prettyDuration(this.task.constraints && this.task.constraints.maxWallClockTime);
        if (this.task.didTimeout) {
            return `Task timed out after running for ${maxTime}`;
        } else if (this.isTaskTimeoutClose) {
            return `Task is close to timeout at ${maxTime}`;
        } else {
            return "";
        }
    }

    /**
     * If the task completed with a warning
     */
    public get completedWarning() {
        if (!this.completed) {
            return false;
        }
        const info = this.task.executionInfo;
        return info ? info.exitCode !== 0 : false;
    }

    public get activeMessage() {
        if (this.active) {
            return "Waiting for an available node to be scheduled";
        } else {
            return "Task was scheduled to a node";
        }
    }

    public goToPreparationTask() {
        this.router.navigate(["/jobs", this.job.id], {
            queryParams: {
                tab: "hooktasks",
            },
        });
    }
}
