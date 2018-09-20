import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from "@angular/core";
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
        // tslint:disable-next-line:max-line-length
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiInstanceSettingsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MultiInstanceSettingsPickerComponent), multi: true },
    ],
})
export class MultiInstanceSettingsPickerComponent implements ControlValueAccessor, Validator {
    public form: FormGroup;

    private _propagateChangeFn: (value: MultiInstanceSettingsAttributes) => void;

    constructor(private changeDetector: ChangeDetectorRef, formBuilder: FormBuilder) {
        this.changeDetector.markForCheck();

        this.form = formBuilder.group({
            numberOfInstances: [1, [Validators.min(0), Validators.required]],
            coordinationCommandLine: ["", Validators.required],
            commonResourceFiles: [[]],
        });

        this.form.valueChanges.subscribe(() => {
            if (this._propagateChangeFn) {
                const value = this.form.value;
                if (value.coordinationCommandLine) {
                    this._propagateChangeFn(this.form.value);
                } else {
                    this._propagateChangeFn(null);
                }
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
