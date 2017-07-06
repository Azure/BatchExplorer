import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

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
    public title: string;

    @Input()
    public subtitle: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

    @Input()
    public closeText: string = "Close";

    @Input()
    public dialogRef: MdDialogRef<any>;

    @autobind()
    public close() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
