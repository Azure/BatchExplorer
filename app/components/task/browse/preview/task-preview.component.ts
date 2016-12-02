import { Component, Input } from "@angular/core";

import { TaskState } from "app/models";

@Component({
    selector: "bex-task-preview",
    template: require("./task-preview.html"),
})

/**
 * Display preview infomration about a task.
 * Handles both task and subTask
 */
export class TaskPreviewComponent {
    public taskStates = TaskState;

    @Input()
    public task: any;

    public elapsedTime = "";

    public get exitCode() {
        const code = this.task.executionInfo ? this.task.executionInfo.exitCode : this.task.exitCode;
        return code === undefined ? "?" : code;
    }

    public get startTime() {
        return this.task.startTime || this.task.executionInfo.startTime;
    }
}
