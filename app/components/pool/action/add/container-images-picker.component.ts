import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ContainerImage } from "app/models/dtos";

@Component({
    selector: "bl-container-images-picker",
    templateUrl: "container-images-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContaienrImagesPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContaienrImagesPickerComponent), multi: true },
    ],
})
export class ContaienrImagesPickerComponent implements ControlValueAccessor, OnDestroy {
    public images: FormControl;

    private _propagateChange: (value: ContainerImage[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.images = this.formBuilder.control([]);
        this._sub = this.images.valueChanges.subscribe((images) => {
            if (this._propagateChange) {
                this._propagateChange(images);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ContainerImage[]) {
        if (value) {
            this.images.setValue(value);
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
