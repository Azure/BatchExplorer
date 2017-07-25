import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskService } from "app/components/base/background-task";
import { DeleteContainerAction } from "app/components/data/action";
import { StorageService } from "app/services";

@Component({
    selector: "bl-delete-container-dialog",
    templateUrl: "delete-container-dialog.html",
})
export class DeleteContainerDialogComponent {
    public id: string;
    public name: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteContainerDialogComponent>,
        private storageService: StorageService,
        private taskManager: BackgroundTaskService) {
    }

    @autobind()
    public destroy() {
        const task = new DeleteContainerAction(this.storageService, [this.id]);
        task.startAndWaitAsync(this.taskManager);

        return task.actionDone;
    }
}
