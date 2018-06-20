import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ContainerRegistryDto } from "app/models/dtos";

@Component({
    selector: "bl-container-registry-picker",
    templateUrl: "container-registry-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContainerRegistryPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainerRegistryPickerComponent), multi: true },
    ],
})
export class ContainerRegistryPickerComponent implements ControlValueAccessor, OnDestroy {
    public registries: FormControl;

    private _propagateChange: (value: ContainerRegistryDto[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.registries = this.formBuilder.control([]);
        this._sub = this.registries.valueChanges.subscribe((registries) => {
            if (this._propagateChange) {
                this._propagateChange(registries);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ContainerRegistryDto[]) {
        if (value) {
            this.registries.setValue(value);
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
