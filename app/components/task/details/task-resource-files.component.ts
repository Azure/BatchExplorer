import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { ResourceFile, Task } from "app/models";

@Component({
    selector: "bl-task-resource-files",
    templateUrl: "task-resource-files.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskResourceFilesComponent implements OnChanges {
    @Input() public task: Task;

    public resourceFiles: List<ResourceFile> = List([]);

    public ngOnChanges(changes) {
        if (changes.task && this.task) {
            this.resourceFiles = this.task.resourceFiles;
        }
    }

    public trackByFn(_, task: ResourceFile) {
        return task.blobSource;
    }

    public openResourceFile(resourceFile: ResourceFile) {
        console.log("OPen", resourceFile.blobSource);
    }
}
