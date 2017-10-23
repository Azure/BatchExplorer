import { Component, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from "@angular/forms";
import { JobTaskBaseComponent } from "./job-task-base.component";

const DEFAULT_JOBPREPARATION_ID = "jobpreparation";

@Component({
    selector: "bl-job-preparation-task-picker",
    templateUrl: "job-preparation-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobPreparationTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobPreparationTaskPickerComponent), multi: true },
    ],
})
export class JobPreparationTaskPickerComponent extends JobTaskBaseComponent implements ControlValueAccessor {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder);
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

    public writeValue(value: any) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.reset();
        }
    }

    public reset() {
        this.form.reset({
            id: DEFAULT_JOBPREPARATION_ID,
            commandLine: "",
            waitForSuccess: true,
            rerunOnNodeRebootAfterSuccess: true,
        });
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (!valid) {
            return {
                jobPreparationTaskPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }
}
