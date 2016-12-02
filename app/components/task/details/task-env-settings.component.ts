import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { NameValuePair, Task } from "app/models";

@Component({
    selector: "bex-task-environment-settings",
    template: require("./task-env-settings.html"),
})

export class TaskEnvironmentSettingsComponent implements OnDestroy {
    @Input()
    public set task(task: Task) {
        this._task = task;
        this.refresh(task);
    }
    public get task() { return this._task; }
    public environmentSettings: NameValuePair[] = [];

    private _task: Task;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(task: Task) {
        if (this.task) {
            this.environmentSettings = this.task.environmentSettings || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
