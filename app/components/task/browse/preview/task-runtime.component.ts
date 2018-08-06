import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { TaskState } from "app/models";

import "./task-runtime.scss";

/**
 * Display runtime information about a task.
 * Handles both task and subTask
 */
@Component({
    selector: "bl-task-runtime",
    templateUrl: "task-runtime.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskRuntimeComponent {
    public elapsedTime = "";
    public taskStates = TaskState;

    @Input() public task: any;

    public get failed() {
        const info = this.task.executionInfo;
        return info && info.failureInfo;
    }

    public get startTime() {
        return this.task.startTime || this.task.executionInfo.startTime;
    }

    public get endTime() {
        return this.task.endTime || this.task.executionInfo.endTime;
    }
}
