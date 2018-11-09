import { ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators,
} from "@angular/forms";
import { Pool } from "app/models";
import { Duration, duration } from "moment";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

import "./pool-scale-picker.scss";

export interface PoolScaleSelection {
    enableAutoScale: boolean;
    targetDedicatedNodes?: number;
    targetLowPriorityNodes?: number;
    resizeTimeout?: Duration;
    autoScaleFormula?: string;
    autoScaleEvaluationInterval?: Duration;
}

function cleanSelection(value: PoolScaleSelection): PoolScaleSelection {
    if (value.enableAutoScale) {
        return {
            enableAutoScale: true,
            autoScaleFormula: value.autoScaleFormula,
            autoScaleEvaluationInterval: value.autoScaleEvaluationInterval || duration("PT15M"),
        };
    } else {
        return {
            enableAutoScale: false,
            targetDedicatedNodes: value.targetDedicatedNodes,
            targetLowPriorityNodes: value.targetLowPriorityNodes,
            resizeTimeout: value.resizeTimeout || duration("PT15M"),
        };
    }
}

@Component({
    selector: "bl-pool-scale-picker",
    templateUrl: "pool-scale-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolScalePickerComponent implements OnDestroy, ControlValueAccessor {
    @Input() public pool: Pool;

    public form: FormGroup;

    private _propagateChange: (value: PoolScaleSelection) => void;
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
            autoScaleEvaluationInterval: ["PT15M"],
            resizeTimeout: ["PT15M"],
        });

        this._subs.push(this._enableAutoScaleControl.valueChanges.subscribe((enableAutoScale) => {
            this._updateValidators(enableAutoScale);
        }));

        this._updateValidators(this._enableAutoScaleControl.value);

        this._subs.push(this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(cleanSelection(value));
            }
        }));
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: PoolScaleSelection) {
        if (value) {
            this.form.patchValue(cleanSelection(value));
        } else {
            console.log("Go herer");
            this.form.patchValue({
                enableAutoScale: false,
                targetDedicatedNodes: 0,
                targetLowPriorityNodes: 0,
                resizeTimeout: duration("PT15M"),
            });
        }
    }

    public registerOnChange(fn: (value: PoolScaleSelection) => void) {
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

    public get enableAutoScale() {
        return this.form.value.enableAutoScale;
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
