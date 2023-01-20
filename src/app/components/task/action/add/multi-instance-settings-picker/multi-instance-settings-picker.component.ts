import { ChangeDetectionStrategy, Component, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormBuilder, FormGroup,
    NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators,
} from "@angular/forms";
import { MultiInstanceSettingsAttributes } from "app/models";

import "./multi-instance-settings-picker.scss";

@Component({
    selector: "bl-multi-instance-settings-picker",
    templateUrl: "multi-instance-settings-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // eslint-disable-next-line max-len
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiInstanceSettingsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MultiInstanceSettingsPickerComponent), multi: true },
    ],
})
export class MultiInstanceSettingsPickerComponent implements ControlValueAccessor, Validator {
    public form: FormGroup;

    private _propagateChangeFn: (value: MultiInstanceSettingsAttributes) => void;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            numberOfInstances: [1, [Validators.min(0), Validators.required]],
            coordinationCommandLine: ["", Validators.required],
            commonResourceFiles: [[]],
        });

        this.form.valueChanges.subscribe(() => {
            if (this._propagateChangeFn) {
                const value = this.form.value;
                this._propagateChangeFn(value);
            }
        });
    }

    public writeValue(settings: MultiInstanceSettingsAttributes | null): void {
        if (settings) {
            this.form.patchValue(settings);
        }
    }

    public registerOnChange(fn: (value: MultiInstanceSettingsAttributes | null) => void): void {
        this._propagateChangeFn = fn;
    }

    public registerOnTouched(fn: any): void {
        // Todo
    }

    public validate(c: AbstractControl): ValidationErrors {
        return null;
    }

}
