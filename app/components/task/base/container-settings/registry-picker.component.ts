import { Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { ContainerRegistry } from "app/models/dtos";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-registry-picker",
    templateUrl: "registry-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RegistryPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => RegistryPickerComponent), multi: true },
    ],
})
export class RegistryPickerComponent implements ControlValueAccessor, OnDestroy {
    public form: FormGroup;
    public customValue: boolean;
    public registry: ContainerRegistry;

    private _propagateChange: (value: ContainerRegistry) => void = null;

    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group( {
            username: [null],
            password: [null],
            registryServer: [null],
        });
        this.customValue = false;
        this._sub = this.form.valueChanges.subscribe((containerSettings) => {
            if (this._propagateChange) {
                this._propagateChange(containerSettings);
            }
        });
    }
    public onSlideToggle(event) {
        this.customValue = event.checked;
        this.registry = this.customValue ? this.form.value : null;
        if (this._propagateChange) {
            this._propagateChange(this.registry);
        }
    }

    public ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    public writeValue(value: ContainerRegistry) {
        this.customValue = Boolean(value);
        this.registry = value;
        if (value) {
            this.form.patchValue(value);
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
