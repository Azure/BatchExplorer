import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AsyncValidatorFn, FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { autobind } from "@batch-flask/core";
import { AsyncSubject, Observable } from "rxjs";
import { ValidatorMessage } from "../dialog.service";

@Component({
    selector: "bl-prompt-dialog",
    templateUrl: "prompt-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptDialogComponent {
    public title: string;
    public description: string;
    public execute: (value: string) => Observable<any>;
    public promptControl = new FormControl();
    public form: FormGroup;
    public validatorMessages: ValidatorMessage[];

    public set validator(validator: ValidatorFn | ValidatorFn[] | null) {
        this.promptControl.setValidators(validator);
    }
    public set asyncValidator(asyncValidator: AsyncValidatorFn | AsyncValidatorFn[]) {
        this.promptControl.setAsyncValidators(asyncValidator);
    }

    public response = new AsyncSubject<string>();

    constructor(public dialogRef: MatDialogRef<PromptDialogComponent>) {
        this.response.next(null);
        this.form = new FormGroup({
            prompt: this.promptControl,
        });
    }

    @autobind()
    public submit() {
        return this.execute(this.promptControl.value);
    }

    public done() {
        this.response.complete();
    }

    public trackByFn(_, entry: ValidatorMessage) {
      return entry.code;
    }

}
