import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS,
    NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { Constants } from "app/utils";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

@Component({
    selector: "bl-file-group-options-picker",
    templateUrl: "file-group-options-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileGroupOptionsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileGroupOptionsPickerComponent), multi: true },
    ],
})
export class FileGroupOptionsPickerComponent implements OnDestroy, ControlValueAccessor {
    public form: FormGroup;

    private _propagateChange: (value: any) => void;
    private _propagateTouched: (value: boolean) => void = null;
    private _valueChangeSub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            prefix: [null, Validators.pattern(Constants.forms.validation.regex.id)],
            flatten: [false, this._validateFlatten()],
            fullPath: [false, this._validateFullPath()],
        });

        this._valueChangeSub = this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
            this._emitChangeAndTouchedEvents(value);
        });
    }

    public ngOnDestroy() {
        this._valueChangeSub.unsubscribe();
    }

    public writeValue(value: any) {
        value = value || {};
        this.form.patchValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    // need this in order for the bl-error validation control to work
    public registerOnTouched(fn) {
        this._propagateTouched = fn;
    }

    /**
     * Return validation result to the parent form
     * @param control
     */
    public validate(control: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }

        return {
            options: this.form.errors,
        };
    }

    /**
     * Cannot have both Flatten and FullPath selected at the same time
     */
    private _validateFullPath(): { [key: string]: any } {
        return (control: FormControl): { [key: string]: any } => {
            return this._validateOtherControl(control, this.form && this.form.controls.flatten);
        };
    }

    /**
     * Cannot have both Flatten and FullPath selected at the same time
     */
    private _validateFlatten(): { [key: string]: any } {
        return (control: FormControl): { [key: string]: any } => {
            return this._validateOtherControl(control, this.form && this.form.controls.fullPath);
        };
    }

    private _validateOtherControl(control: FormControl, otherControl: AbstractControl) {
        if (!this.form || !otherControl || !otherControl.value) {
            return null;
        }

        const result = control.value ? { invalid: true } : null;
        if (!result) {
            otherControl.updateValueAndValidity();
        }

        return result;
    }

    private _emitChangeAndTouchedEvents(value) {
        if (this._propagateChange) {
            setTimeout(() => {
                this._propagateChange(value);
            });
        }

        if (this._propagateTouched) {
            setTimeout(() => {
                this._propagateTouched(true);
            });
        }
    }
}
