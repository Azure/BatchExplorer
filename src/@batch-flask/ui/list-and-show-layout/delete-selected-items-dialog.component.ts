import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { Observable } from "rxjs";

@Component({
    selector: "bl-delete-selected-items-dialog",
    templateUrl: "delete-selected-items.html",
})
export class DeleteSelectedItemsDialogComponent {
    public parentId: string;
    public entityName: string;
    public items: string[];

    constructor(public dialogRef: MatDialogRef<DeleteSelectedItemsDialogComponent>) {
    }

    @autobind()
    public destroyEntities() {
        return Observable.of(this.dialogRef.close(true));
    }

    public trackByFn(index, item: string) {
        return item;
    }
}
