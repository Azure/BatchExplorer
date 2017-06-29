import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import {  Observable } from "rxjs";

@Component({
    selector: "bl-delete-selected-items-dialog",
    templateUrl: "delete-selected-items.html",
})
export class DeleteSelectedItemsDialogComponent {
    public parentId: string;
    public entityName: string;
    public items: string[];

    constructor(public dialogRef: MdDialogRef<DeleteSelectedItemsDialogComponent>) {
    }

    @autobind()
    public destroyEntities() {
        return Observable.of(this.dialogRef.close(true));
    }
}
