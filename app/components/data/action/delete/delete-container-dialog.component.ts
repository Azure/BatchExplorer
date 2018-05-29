import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteContainerAction } from "app/components/data/action";
import { StorageContainerService } from "app/services/storage";

@Component({
    selector: "bl-delete-container-dialog",
    templateUrl: "delete-container-dialog.html",
})
export class DeleteContainerDialogComponent {
    public storageAccountId: string;
    public id: string;
    public name: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteContainerDialogComponent>,
        private storageContainerService: StorageContainerService,
        private taskManager: BackgroundTaskService) {
    }

    @autobind()
    public destroy() {
        const task = new DeleteContainerAction(this.storageContainerService, this.storageAccountId, [this.id]);
        task.startAndWaitAsync(this.taskManager);

        return task.actionDone;
    }
}
