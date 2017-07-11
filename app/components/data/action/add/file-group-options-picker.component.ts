import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { Constants } from "app/utils";

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
            prefix: ["", Validators.pattern(Constants.forms.validation.regex.id)],
            flatten: false,
            fullPath: false,
        });

        this._valueChangeSub = this.form.valueChanges.distinctUntilChanged().subscribe((value) => {
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

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }

        return {
            options: this.form.errors,
        };
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
