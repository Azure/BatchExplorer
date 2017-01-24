import { Component, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";

@Component({
    selector: "bex-start-task-picker",
    templateUrl: "start-task-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StartTaskPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => StartTaskPickerComponent), multi: true },
    ],
})
export class StartTaskPickerComponent implements ControlValueAccessor {
    public form: FormGroup;
    private _propagateChange: Function = null;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            enableStartTask: [false],
            commandLine: ["", Validators.required],
            maxTaskRetryCount: ["0"],
            runElevated: [false],
            waitForSuccess: [false],
            resourceFiles: [[]],
            environmentSettings: [[]],
        });

        this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val.enableStartTask ? val : null);
            }
        });
    }

    public get enableStartTask() {
        return this.form.controls["enableStartTask"].value;
    }

    public writeValue(value: any) {
        if (value) {
            this.form.patchValue({
                enableStartTask: true,
                ...value,
            });
        } else {
            this.form.patchValue({
                enableStartTask: false,
            });
        }
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
                startTaskPicker: {
                    valid: false,
                    missingSelection: true,
                },
            };
        }

        return null;
    }
}
