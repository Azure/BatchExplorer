import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ContainerConfiguration, TaskContainerSettings } from "app/models/dtos";

@Component({
    selector: "bl-container-settings-picker",
    templateUrl: "container-settings-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContainerSettingsPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainerSettingsPickerComponent), multi: true },
    ],
})
export class ContainerSettingsPickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public containerConfiguration: ContainerConfiguration = null;
    public containerSettings: FormGroup;

    private _propagateChange: (value: TaskContainerSettings) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.containerSettings = this.formBuilder.group({
            imageName: ["", Validators.required],
            containerRunOptions: [null],
            registry: [null],
        });
        this._sub = this.containerSettings.valueChanges.subscribe((containerSettings) => {
            if (this._propagateChange) {
                this._propagateChange(containerSettings);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: TaskContainerSettings) {
        if (value) {
            this.containerSettings.setValue(value);
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
