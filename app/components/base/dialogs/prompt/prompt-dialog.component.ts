import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { AsyncSubject, Observable } from "rxjs";

@Component({
    selector: "bl-prompt-dialog",
    templateUrl: "prompt-dialog.html",
})
export class PromptDialogComponent {
    public title: string;
    public description: string;
    public execute: (value: string) => Observable<any>;
    public promptControl = new FormControl();

    public response = new AsyncSubject<string>();

    constructor(public dialogRef: MdDialogRef<PromptDialogComponent>) {
        this.response.next(null);
    }

    @autobind()
    public submit() {
        return this.execute(this.promptControl.value);
    }

    public done() {
        this.response.complete();
    }
}
