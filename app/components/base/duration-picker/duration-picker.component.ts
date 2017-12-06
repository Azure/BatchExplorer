import { Component, Input, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";

import { UNLIMITED_DURATION_THRESHOLD } from "app/core";
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

    protected _propagateChange: (value: moment.Duration) => void = null;
    protected _duration: moment.Duration;

    public get duration(): moment.Duration {
        return this._duration;
    }

    public set duration(value: moment.Duration) {
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

    public writeValue(value: moment.Duration): void {
        this._duration = value;
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

    private _getDuration(): moment.Duration {
        const duration = moment.duration(this.value, this.unit);
        const days = duration.asDays();
        // Days must not be greater than threshold, otherwise just set it to unlimited
        return days > UNLIMITED_DURATION_THRESHOLD ? null : duration;
    }

    /**
     * _setValueAndUnit helps setting constraint duration picker value once constraint form value is patched.
     * Unit is checked from 'days' to 'seconds'. Value will be taken when current unit has an integer value,
     * otherwise next smaller unit will be checked until last unit.
     */
    private _setValueAndUnit() {
        this.unlimited = !this.duration as boolean;

        if (this.duration) {
            const days = this.duration.asDays();
            const hours = this.duration.asHours();
            const minutes = this.duration.asMinutes();
            const seconds = this.duration.asSeconds();
            if (this._isValidUnit(days)) {
                this.value = days;
                this.unit = ConstraintsUnit.days;
            } else if (this._isValidUnit(hours)) {
                this.value = hours;
                this.unit = ConstraintsUnit.hours;
            } else if (this._isValidUnit(minutes)) {
                this.value = minutes;
                this.unit = ConstraintsUnit.minutes;
            } else if (seconds > 0) {
                // don't check whether second is integer or not, just display whatever this value is
                this.value = seconds;
                this.unit = ConstraintsUnit.seconds;
            }
        }
    }

    private _isValidUnit(value: number) {
        return Number(value) === value && value % 1 === 0 && value > 0;
    }
}
