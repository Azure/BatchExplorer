import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { Pool } from "app/models";

import "./pool-scale-picker.scss";

@Component({
    selector: "bl-pool-scale-picker",
    templateUrl: "pool-scale-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
    ],
})
export class PoolScalePickerComponent implements OnDestroy, ControlValueAccessor {
    @Input() public pool: Pool;

    public form: FormGroup;

    public selectedModeTab = 0;

    private _propagateChange: (value: any) => void;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            enableAutoScale: false,
            autoScaleFormula: ["", this._invalidAutoscaleFormula()],
            targetDedicatedNodes: [0, this._invalidTargetNodes()],
            targetLowPriorityNodes: [0, this._invalidTargetNodes()],
            autoScaleEvaluationInterval: [15],
            resizeTimeout: [15],
        });

        this._sub = this.form.valueChanges.distinctUntilChanged().subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: any) {
        value = value || {};
        this.form.patchValue(value);
        if (value.enableAutoScale) {
            this.selectedModeTab = 1;
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
        if (fn) {
            fn(this.form.value);
        }
    }

    public registerOnTouched(fn) {
        // Nothing to do
    }

    public validate(c: FormControl) {
        const valid = this.form.valid;
        if (valid) {
            return null;
        }

        return {
            scalePicker: this.form.errors,
        };
    }

    public changeScaleModeTab(event) {
        this.selectedModeTab = event.index;

        if (event.index === 0) {
            this.form.patchValue({ enableAutoScale: false });
        } else if (event.index === 1) {
            this.form.patchValue({ enableAutoScale: true });
        }
        this.form.controls.autoScaleFormula.updateValueAndValidity();
    }

    private _invalidAutoscaleFormula() {
        return (control: FormControl): { [key: string]: any } => {
            if (!this.form || !this.form.controls.enableAutoScale.value) {
                return null;
            }
            return control.value ? null : { required: true };
        };
    }

    private _invalidTargetNodes() {
        return (control: FormControl): { [key: string]: any } => {
            if (!this.form || this.form.controls.enableAutoScale.value) {
                return null;
            }
            return control.value !== null ? null : { required: true };
        };
    }
}
