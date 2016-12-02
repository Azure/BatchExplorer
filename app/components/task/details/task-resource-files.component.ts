import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { ResourceFile, Task } from "app/models";

@Component({
    selector: "bex-task-resource-files",
    template: require("./task-resource-files.html"),
})

export class TaskResourceFilesComponent implements OnDestroy {
    @Input()
    public set task(task: Task) {
        this._task = task;
        this.refresh(task);
    }
    public get task() { return this._task; }
    public resourceFiles: ResourceFile[] = [];

    private _task: Task;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(task: Task) {
        if (this.task) {
            this.resourceFiles = this.task.resourceFiles || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
