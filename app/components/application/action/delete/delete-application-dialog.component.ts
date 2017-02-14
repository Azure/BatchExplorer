import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { ApplicationService } from "app/services";
import { DeleteApplicationAction } from "./";

@Component({
    selector: "bex-delete-application-dialog",
    templateUrl: "delete-application-dialog.html",
})
export class DeleteApplicationDialogComponent {
    public applicationId: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteApplicationDialogComponent>,
        private applicationService: ApplicationService,
        private taskManager: BackgroundTaskManager) {
    }

    @autobind()
    public destroyApplication() {
        const task = new DeleteApplicationAction(this.applicationService, this.applicationId);
        task.startAndWaitAsync(this.taskManager);

        return task.actionDone;
    }
}
