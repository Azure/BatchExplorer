import { Component, Input } from "@angular/core";
import { List } from "immutable";

import { ResourceFile, Task } from "app/models";

@Component({
    selector: "bl-task-resource-files",
    templateUrl: "task-resource-files.html",
})

export class TaskResourceFilesComponent {
    @Input()
    public set task(task: Task) {
        this._task = task;
        this.refresh(task);
    }
    public get task() { return this._task; }

    public resourceFiles: List<ResourceFile> = List([]);

    private _task: Task;

    public refresh(task: Task) {
        if (this.task) {
            this.resourceFiles = this.task.resourceFiles;
        }
    }

    public trackByFn(index, task: ResourceFile) {
        return task.blobSource;
    }
}
