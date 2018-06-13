import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Self,
} from "@angular/core";
import {
    ControlValueAccessor,
    NgControl,
} from "@angular/forms";
import { FlagInput, UNLIMITED_DURATION_THRESHOLD, coerceBooleanProperty } from "@batch-flask/core";
import { FormFieldControl } from "@batch-flask/ui/form/form-field";
import * as moment from "moment";

import { Subject } from "rxjs";
import "./duration-picker.scss";

/**
 * Enumration of time unit picker that can be directly used in momentjs
 * Days, hours, minutes and seconds
 */
export enum ConstraintsUnit {
    Unlimited = "unlimited",
    Days = "days",
    Hours = "hours",
    Minutes = "minutes",
    Seconds = "seconds",
    Custom = "custom",
}

let nextUniqueId = 0;

/**
 * DurationPickerComponent is used in jobConstraint and taskConstraint.
 * This class includes a time input and time unit picker which is converted to ISODuration format before submitted
 * to server. This picker also includes a 'unlimited' mode which set current duration to null
 */
@Component({
    selector: "bl-duration-picker",
    templateUrl: "duration-picker.html",
    providers: [
        { provide: FormFieldControl, useExisting: DurationPickerComponent },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationPickerComponent implements FormFieldControl<any>, ControlValueAccessor, OnChanges, OnDestroy {
    get id(): string { return this._id; }
    set id(value: string) { this._id = value || this._uid; }

    @Input()
    @HostBinding("attr.aria-label")
    @HostBinding("attr.placeholder")
    public label: string;

    @Input() public allowUnlimited: boolean = true;

    @Input() @FlagInput() public required = false;

    @Input()
    public get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    public get placeholder() {
        return this.label;
    }

    public readonly stateChanges = new Subject<void>();

    public value: moment.Duration;

    // set default unit value to 'minutes'
    public unit: ConstraintsUnit = ConstraintsUnit.Unlimited;
    public ConstraintsUnit = ConstraintsUnit;
    protected _uid = `bl-input-${nextUniqueId++}`;

    protected _propagateChange: (value: moment.Duration) => void = null;
    protected _duration: moment.Duration;
    private _id: string;
    private _disabled: boolean;

    public get duration(): moment.Duration {
        return this._duration;
    }

    public set duration(value: moment.Duration) {
        this._duration = value;
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        @Optional() @Self() public ngControl: NgControl) {

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnChanges() {
        this.stateChanges.next();
    }

    public ngOnDestroy() {
        this.stateChanges.complete();
    }

    public onTimeChange(event) {
        this.duration = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this.duration);
        }
    }

    public updateUnit(unit: ConstraintsUnit) {
        this.unit = unit;
        this.duration = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this.duration);
        }
        this.changeDetector.markForCheck();
    }

    public writeValue(value: moment.Duration | string): void {
        if (value === null || value === undefined) {
            this.duration = null;
        } else if (moment.isMoment(value)) {
            this.duration = value as moment.Duration;
        } else {
            this.duration = moment.duration(value);
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

    public setDescribedByIds(ids: string[]): void {
        throw new Error("Method not implemented.");
    }
    public onContainerClick(event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }

    private _getDuration(): moment.Duration {
        switch (this.unit) {
            case ConstraintsUnit.Unlimited:
                return null;
            case ConstraintsUnit.Custom:
                return moment.duration(this.value);
            default:
                const duration = moment.duration(this.value, this.unit);
                return this._isDurationUnlimited(duration) ? null : duration;
        }
    }

    private _isDurationUnlimited(duration: moment.Duration): boolean {
        if (!duration) {
            return true;
        }
        const days = duration.asDays();
        // Days must not be greater than threshold, otherwise just set it to unlimited
        return days > UNLIMITED_DURATION_THRESHOLD;
    }

    /**
     * _setValueAndUnit helps setting constraint duration picker value once constraint form value is patched.
     * Unit is checked from 'days' to 'seconds'. Value will be taken when current unit has an integer value,
     * otherwise next smaller unit will be checked until last unit.
     */
    private _setValueAndUnit() {
        // this.unlimited = this._isDurationUnlimited(this.duration);
        // if (this.unlimited || moment.isMoment(this.duration)) { return; }
        // const days = this.duration.asDays();
        // const hours = this.duration.asHours();
        // const minutes = this.duration.asMinutes();
        // const seconds = this.duration.asSeconds();
        // if (this._isValidUnit(days)) {
        //     this.value = days;
        //     this.unit = ConstraintsUnit.days;
        // } else if (this._isValidUnit(hours)) {
        //     this.value = hours;
        //     this.unit = ConstraintsUnit.hours;
        // } else if (this._isValidUnit(minutes)) {
        //     this.value = minutes;
        //     this.unit = ConstraintsUnit.minutes;
        // } else if (seconds > 0) {
        //     // don't check whether second is integer or not, just display whatever this value is
        //     this.value = seconds;
        //     this.unit = ConstraintsUnit.seconds;
        // }
    }

    // private _isValidUnit(value: number) {
    //     return Number(value) === value && value % 1 === 0 && value > 0;
    // }
}
