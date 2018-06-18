import { Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { Pool } from "app/models";

import "./pool-scale-picker.scss";

@Component({
    selector: "bl-pool-scale-picker",
    templateUrl: "pool-scale-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
    ],
})
export class PoolScalePickerComponent implements OnDestroy, ControlValueAccessor {
    @Input() public pool: Pool;

    public form: FormGroup;

    public selectedModeTab = 0;

    private _propagateChange: (value: any) => void;
    private _subs: Subscription[] = [];

    private _enableAutoScaleControl = new FormControl(false);
    private _autoScaleFormulaControl = new FormControl("");
    private _targetDedicatedNodes = new FormControl(0);
    private _targetLowPriorityNodes = new FormControl(0);

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            enableAutoScale: this._enableAutoScaleControl,
            autoScaleFormula: this._autoScaleFormulaControl,
            targetDedicatedNodes: this._targetDedicatedNodes,
            targetLowPriorityNodes: this._targetLowPriorityNodes,
            autoScaleEvaluationInterval: [15],
            resizeTimeout: [15],
        });

        this._subs.push(this._enableAutoScaleControl.valueChanges.subscribe((enableAutoScale) => {
            this._updateValidators(enableAutoScale);
        }));

        this._updateValidators(this._enableAutoScaleControl.value);

        this._subs.push(this.form.valueChanges.distinctUntilChanged().subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
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

    private _updateValidators(enableAutoScale: boolean) {
        if (enableAutoScale) {
            this._autoScaleFormulaControl.setValidators([Validators.required]);
            this._targetDedicatedNodes.setValidators([]);
            this._targetLowPriorityNodes.setValidators([]);
        } else {
            this._autoScaleFormulaControl.setValidators([]);
            this._targetDedicatedNodes.setValidators([Validators.required]);
            this._targetLowPriorityNodes.setValidators([Validators.required]);
        }
        this._autoScaleFormulaControl.updateValueAndValidity();
        this._targetDedicatedNodes.updateValueAndValidity();
        this._targetLowPriorityNodes.updateValueAndValidity();
    }
}
