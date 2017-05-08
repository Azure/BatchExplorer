import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-user-accounts-picker",
    templateUrl: "user-accounts-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserAccountsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => UserAccountsPickerComponent), multi: true },
    ],
})
export class UserAccountsPickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    public form: FormGroup;
    private _propagateChange: Function = null;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            name: ["", Validators.required],
            password: ["", Validators.required],
            runElevated: [false],
        });

        this._sub = this.form.valueChanges.subscribe((val: any) => {
            if (this._propagateChange) {
                this._propagateChange(val);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();

    }
    public writeValue(value: any) {
        if (value) {
            this.form.patchValue(value);
        } else {
            this.form.reset();
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
                userAccounts: false,
            };
        }

        return null;
    }
}
