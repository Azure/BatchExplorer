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

const DEFAULT_JOBRELEASE_ID = "jobrelease";

@Component({
    selector: "bl-job-release-task-picker",
    templateUrl: "job-release-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobReleaseTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobReleaseTaskPickerComponent), multi: true },
    ],
})
export class JobReleaseTaskPickerComponent extends JobTaskBaseComponent implements ControlValueAccessor {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder);
        this._baseFormControls["id"] = [DEFAULT_JOBRELEASE_ID, Validators.required];
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
            id: DEFAULT_JOBRELEASE_ID,
            commandLine: "",
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
                jobReleaseTaskPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }
}
