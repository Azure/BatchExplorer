import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ResourceFile } from "app/models";

// tslint:disable:no-forward-ref

@Component({
    selector: "bl-app-package-picker",
    templateUrl: "app-package-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
    ],
})
export class AppPackagePickerComponent implements ControlValueAccessor, OnDestroy {
    public files: FormControl;

    private _propagateChange: (value: ResourceFile[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.files = this.formBuilder.control([]);
        this._sub = this.files.valueChanges.subscribe((files) => {
            if (this._propagateChange) {
                this._propagateChange(files);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ResourceFile[]) {
        if (value) {
            this.files.setValue(value);
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }
}
