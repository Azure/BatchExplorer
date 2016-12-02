import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { ApplicationPackageReference, Task } from "app/models";

@Component({
    selector: "bex-task-app-packages",
    template: require("./task-app-packages.html"),
})

export class TaskAppPackagesComponent implements OnDestroy {
    @Input()
    public set task(task: Task) {
        this._task = task;
        this.refresh(task);
    }
    public get task() { return this._task; }
    public appPackages: ApplicationPackageReference[] = [];

    private _task: Task;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(task: Task) {
        if (this.task) {
            this.appPackages = this.task.applicationPackageReferences || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
