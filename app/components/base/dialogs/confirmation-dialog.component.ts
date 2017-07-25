import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { AsyncSubject, Observable } from "rxjs";

@Component({
    selector: "bl-confirmation-dialog",
    templateUrl: "confirmation-dialog.html",
})
export class ConfirmationDialogComponent {
    public title: string;
    public description: string;
    public execute: () => Observable<any>;

    public response = new AsyncSubject<boolean>();

    constructor(public dialogRef: MdDialogRef<ConfirmationDialogComponent>) {
        this.response.next(false);
    }

    @autobind()
    public submit() {
        return this.execute();
    }

    public done() {
        this.response.complete();
    }
}
