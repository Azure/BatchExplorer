import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { ConfirmationDialog } from "@batch-flask/ui";
import { BlobContainer } from "app/models";

@Component({
    selector: "bl-delete-container-dialog",
    templateUrl: "delete-container-dialog.html",
})
export class DeleteContainerDialogComponent extends ConfirmationDialog<any> {
    public storageAccountId: string;
    public containers: BlobContainer[];

    constructor(public dialogRef: MatDialogRef<DeleteContainerDialogComponent>) {
        super();
    }

    @autobind()
    public ok() {
        this.markAsConfirmed();
    }

    public trackContainer(index, container: BlobContainer) {
        return container.name;
    }
}
