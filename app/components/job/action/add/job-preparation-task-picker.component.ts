import { Component, forwardRef } from "@angular/core";
import {
    FormBuilder,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from "@angular/forms";
import { JobTaskBaseComponent } from "./job-task-base.component";

const DEFAULT_JOBPREPARATION_ID = "jobpreparation";
const DEFAULT_JOBPREPARATION = {
    id: DEFAULT_JOBPREPARATION_ID,
    commandLine: "",
    waitForSuccess: true,
    rerunOnNodeRebootAfterSuccess: true,
};
const INVALID_RESPONSE = {
    jobPreparationTaskPicker: {
        valid: false,
        missingSelection: true,
    },
};

@Component({
    selector: "bl-job-preparation-task-picker",
    templateUrl: "job-preparation-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobPreparationTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobPreparationTaskPickerComponent), multi: true },
    ],
})
export class JobPreparationTaskPickerComponent extends JobTaskBaseComponent {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder, DEFAULT_JOBPREPARATION, INVALID_RESPONSE);
        this._baseFormControls["id"] = [DEFAULT_JOBPREPARATION_ID, Validators.required];
        this._baseFormControls["waitForSuccess"] = [true];
        this._baseFormControls["rerunOnNodeRebootAfterSuccess"] = [true];
        this.form = formBuilder.group(this._baseFormControls);
        this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });
    }
}
