import { Component, Input, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import * as moment from "moment";

import "./duration-picker.scss";

/**
 * Enumration of time unit picker that can be directly used in momentjs
 * Days, hours, minutes and seconds
 */
export enum ConstraintsUnit {
    days = "days",
    hours = "hours",
    minutes = "minutes",
    seconds = "seconds",
}

/**
 * DurationPickerComponent is used in jobConstraint and taskConstraint.
 * This class includes a time input and time unit picker which is converted to ISODuration format before submitted
 * to server. This picker also includes a 'unlimited' mode which set current duration to null
 */
@Component({
    selector: "bl-duration-picker",
    templateUrl: "duration-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DurationPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationPickerComponent), multi: true },
    ],
})
export class DurationPickerComponent implements ControlValueAccessor {
    public value: number;
    // set default unit value to 'minutes'
    public unit: ConstraintsUnit = ConstraintsUnit.minutes;
    public unlimited: boolean = true;
    public ConstraintsUnit = ConstraintsUnit;

    @Input() public label: string;
    @Input() public allowUnlimited: boolean = true;

    protected _propagateChange: (value: any) => void = null;
    protected _duration: string;

    public get duration() {
        return this._duration;
    }

    public set duration(value: string) {
        this._duration = value;
    }

    public onToggle(event) {
        this.unlimited = event.checked;
        this._duration = this.unlimited ? null : this._getDuration();
        if ( this._propagateChange) {
            this._propagateChange(this._duration);
        }
    }

    public onTimeChange(event) {
        this._duration = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this._duration);
        }
    }

    public onUnitChange(event) {
        this._duration = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this._duration);
        }
    }

    public writeValue(value: any): void {
        if (value !== undefined) {
            this._duration = value;
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate() {
        return null;
    }

    private _getDuration(): any {
        return moment.duration(this.value, this.unit);
    }
}
