import { Component, Input } from "@angular/core";

import { TaskState } from "app/models";

@Component({
    selector: "bl-task-preview",
    templateUrl: "task-preview.html",
})

/**
 * Display preview information about a task.
 * Handles both task and subTask
 */
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
        if (code === undefined) {
            return `Task completed with no exit code`;
        } else {
            return `Task completed with exit code ${code}`;
        }
    }

    public get startTime() {
        return this.task.startTime || this.task.executionInfo.startTime;
    }
}
