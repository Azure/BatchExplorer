import { Component, forwardRef } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { DateTime } from "luxon";
import "./aad-app-secret-picker.scss";

enum Expire {
    month1,
    year1,
    year2,
    never,
}

@Component({
    selector: "bl-aad-app-secret-picker",
    templateUrl: "aad-app-secret-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AADAppSecretPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AADAppSecretPickerComponent), multi: true },
    ],
})
export class AADAppSecretPickerComponent implements ControlValueAccessor, Validator {

    public Expire = Expire;
    public form: FormGroup;
    private _propagateChanges: any;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            name: [""],
            value: [""],
            expireIn: [Expire.year1],
        });
        this.form.valueChanges.subscribe(({ value, name, expireIn }) => {
            if (this._propagateChanges) {
                this._propagateChanges({
                    name,
                    value,
                    endDate: this._computeEndDate(expireIn),
                });
            }
        });
    }

    public writeValue(obj: any): void {
        this.form.patchValue(obj);
    }

    public registerOnChange(fn: any): void {
        this._propagateChanges = fn;
    }

    public registerOnTouched(fn: any): void {
        // Nothin
    }

    public validate(c: AbstractControl): { [key: string]: any; } {
        return null;
    }

    private _computeEndDate(expireIn: Expire) {
        const now = DateTime.local();
        switch (expireIn) {
            case Expire.month1:
                return now.plus({months: 1}).toJSDate();
            case Expire.year1:
                return now.plus({years: 1}).toJSDate();
            case Expire.year2:
                return now.plus({years: 2}).toJSDate();
            default:
                return new Date(2299, 12, 31);
        }
    }
}
