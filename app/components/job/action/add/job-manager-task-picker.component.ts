import { Component, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { JobTaskBaseComponent } from "./job-task-base.component";

@Component({
    selector: "bl-job-manager-task-picker",
    templateUrl: "job-manager-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JobManagerTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => JobManagerTaskPickerComponent), multi: true },
    ],
})
export class JobManagerTaskPickerComponent extends JobTaskBaseComponent implements ControlValueAccessor {
    constructor(formBuilder: FormBuilder) {
        super(formBuilder);
        this._baseFormControls["displayName"] = [null];
        this._baseFormControls["killJobOnCompletion"] = [true];
        this._baseFormControls["runExclusive"] = [true];
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
            id: "",
            displayName: null,
            commandLine: "",
            killJobOnCompletion: true,
            runExclusive: true,
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
                jobManagerTaskPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }
        return null;
    }
}
