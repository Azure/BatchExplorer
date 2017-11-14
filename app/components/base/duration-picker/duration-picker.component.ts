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
    protected _duration: any;

    public get duration() {
        return this._duration;
    }

    public set duration(value: any) {
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
        this._setValueAndUnit();
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

    /**
     * _setValueAndUnit helps setting constraint duration picker value once constraint form vlaue is patched.
     * Unit is checked from 'days' to 'seconds'. Value will be taken when current unit has an integer value,
     * otherwise next smaller unit will be checked until last unit.
     */
    private _setValueAndUnit() {
        if (this.duration) {
            const duration = moment.duration(this.duration);
            const days = duration.asDays();
            const hours = duration.asHours();
            const minutes = duration.asMinutes();
            const seconds = duration.asSeconds();
            if (days > 0 && this._isInteger(days)) {
                this.value = days;
                this.unit = ConstraintsUnit.days;
            } else if (hours > 0 && this._isInteger(hours)) {
                this.value = hours;
                this.unit = ConstraintsUnit.hours;
            } else if (minutes > 0 && this._isInteger(minutes)) {
                this.value = minutes;
                this.unit = ConstraintsUnit.minutes;
            } else if (seconds > 0) {
                // don't check whether second is integer or not, just display whatever this value is
                this.value = seconds;
                this.unit = ConstraintsUnit.seconds;
            } else {
                this.value = null;
                this.unit = ConstraintsUnit.minutes;
            }
            this.unlimited = false;
        } else {
            this.unlimited = true;
        }
    }

    private _isInteger(value: number) {
        return Number(value) === value && value % 1 === 0;
    }
}
