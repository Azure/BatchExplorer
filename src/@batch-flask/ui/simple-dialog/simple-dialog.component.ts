import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";

import "./simple-dialog.scss";

/**
 * SimpleDialog is an helper component that displays a standard message dialog and a close button.
 */
@Component({
    selector: "bl-simple-dialog",
    templateUrl: "simple-dialog.html",
})
export class SimpleDialogComponent {
    @Output()
    public done = new EventEmitter();

    @Input()
    public title: string = "Are you sure?";

    @Input()
    public subtitle: string;

    @ViewChild(TemplateRef, { static: true })
    public content: TemplateRef<any>;

    @Input()
    public closeText: string = "Close";

    @Input()
    public dialogRef: MatDialogRef<any>;

    @autobind()
    public close() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
