import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import { CloudFileService } from "@batch-flask/ui";
import { ResourceFile, Task } from "app/models";

@Component({
    selector: "bl-task-resource-files",
    templateUrl: "task-resource-files.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskResourceFilesComponent implements OnChanges {
    @Input() public task: Task;

    public resourceFiles: List<ResourceFile> = List([]);

    constructor(private cloudFileService: CloudFileService) {
    }

    public ngOnChanges(changes) {
        if (changes.task && this.task) {
            this.resourceFiles = this.task.resourceFiles;
        }
    }

    public trackByFn(_, task: ResourceFile) {
        return task.blobSource;
    }

    public openResourceFile(id: string) {
        const resourceFile = this.resourceFiles.filter(x => x.id === id).first();
        if (resourceFile) {
            this.cloudFileService.openFile(resourceFile.blobSource);
        }
    }
}
