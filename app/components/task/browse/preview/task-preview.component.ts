import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { TaskState } from "app/models";

import "./task-preview.scss";

/**
 * Display preview information about a task.
 * Handles both task and subTask
 */
@Component({
    selector: "bl-task-preview",
    templateUrl: "task-preview.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPreviewComponent {
    public elapsedTime = "";
    public taskStates = TaskState;

    @Input()
    public task: any;

    public get exitCode() {
        const code = this.task.executionInfo ? this.task.executionInfo.exitCode : this.task.exitCode;
        return code === undefined ? "?" : code;
    }

    public get exitCodeMessage() {
        const code = this.task.executionInfo ? this.task.executionInfo.exitCode : this.task.exitCode;
        if (code === undefined || code === null) {
            return `Task completed with no exit code`;
        } else {
            return `Task completed with exit code ${code}`;
        }
    }

    public get startTime() {
        return this.task.startTime || this.task.executionInfo.startTime;
    }

    public get endTime() {
        return this.task.endTime || this.task.executionInfo.endTime;
    }
}
