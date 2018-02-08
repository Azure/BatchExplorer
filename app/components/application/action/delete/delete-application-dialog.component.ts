import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "app/core";

import { DeleteApplicationAction } from "app/components/application/action";
import { BackgroundTaskService } from "app/components/base/background-task";
import { ApplicationService } from "app/services";

@Component({
    selector: "bl-delete-application-dialog",
    templateUrl: "delete-application-dialog.html",
})
export class DeleteApplicationDialogComponent {
    public applicationId: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteApplicationDialogComponent>,
        private applicationService: ApplicationService,
        private taskManager: BackgroundTaskService) {
    }

    @autobind()
    public destroyApplication() {
        const task = new DeleteApplicationAction(this.applicationService, [this.applicationId]);
        task.startAndWaitAsync(this.taskManager);

        return task.actionDone;
    }
}
