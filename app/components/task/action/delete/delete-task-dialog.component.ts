import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { ConfirmationDialog } from "@batch-flask/ui";
import { Task } from "app/models";

@Component({
    selector: "bl-delete-task-dialog",
    templateUrl: "delete-task-dialog.html",
})
export class DeleteTaskDialogComponent extends ConfirmationDialog<any> {
    public jobId: string;
    public tasks: Task[];

    constructor(public dialogRef: MatDialogRef<DeleteTaskDialogComponent>) {
        super();
    }

    @autobind()
    public ok() {
        this.markAsConfirmed();
    }
}
