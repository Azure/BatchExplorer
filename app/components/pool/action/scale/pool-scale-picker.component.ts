import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-pool-scale-picker",
    templateUrl: "pool-scale-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolScalePickerComponent), multi: true },
    ],
    styleUrls: ["autoscale-formula-picker"],
})
export class PoolScalePickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    public form: FormGroup;

    private _propagateChange: Function;
    private _sub: Subscription;

    constructor(formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            enableAutoScale: false,
            autoScaleFormula: ["", this._invalidAutoscaleFormula()],
            targetDedicated: [0, this._invalidTargetDedicated()],
            autoScaleEvaluationInterval: [15],
        });

        this._sub = this.form.valueChanges.distinctUntilChanged().subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: any) {
        this.form.patchValue(value || {});
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn) {
        // Nothing to do
    }

    public validate(c: FormControl) {
        // TODO return validity
        return null;
    }

    public changeScaleModeTab(event) {
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

    private _invalidTargetDedicated() {
        return (control: FormControl): { [key: string]: any } => {
            if (!this.form || this.form.controls.enableAutoScale.value) {
                return null;
            }
            return control.value !== null ? null : { required: true };
        };
    }
}
