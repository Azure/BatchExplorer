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
    ViewChild,
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
export enum DurationUnit {
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
    public DurationUnit = DurationUnit;

    @Input()
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value || this._uid; }

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

    public time: string = "";
    public unit: DurationUnit = DurationUnit.Unlimited;

    // Validation fields
    public invalidTimeNumber = false;
    public invalidCustomDuration = false;

    @HostBinding("attr.aria-describedby")
    public ariaDescribedby: string;

    protected _uid = `bl-input-${nextUniqueId++}`;

    protected _propagateChange: (value: moment.Duration) => void = null;
    protected _duration: moment.Duration;

    @ViewChild("inputEl") private _inputEl: ElementRef;
    private _id: string;
    private _disabled: boolean;

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

    public writeValue(value: moment.Duration | string): void {
        if (value === null || value === undefined) {
            this.value = null;
        } else if (moment.isMoment(value)) {
            this.value = value as moment.Duration;
        } else {
            this.value = moment.duration(value);
        }
        this._setTimeAndUnitFromDuration(this.value);
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate() {
        if (this.invalidTimeNumber || this.invalidCustomDuration) {
            return {
                duration: "Invalid",
            };
        }
        return false;
    }

    public setDescribedByIds(ids: string[]): void {
        this.ariaDescribedby = ids.join(" ");
    }
    public onContainerClick(event: MouseEvent): void {
        this._inputEl.nativeElement.focus();
    }

    public updateTime(time: string) {
        this.time = time;
        this.value = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.changeDetector.markForCheck();
    }

    public updateUnit(unit: DurationUnit) {
        this.unit = unit;
        this.value = this._getDuration();
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.changeDetector.markForCheck();
    }

    private _getDuration(): moment.Duration {
        this.invalidTimeNumber = false;

        switch (this.unit) {
            case DurationUnit.Unlimited:
                return null;
            case DurationUnit.Custom:
                return this._getCustomDuration(this.time);
            default:
                const time = Number(this.time);
                if (isNaN(time)) {
                    this.invalidTimeNumber = true;
                    return null;
                } else {
                    const duration = moment.duration(Number(this.time), this.unit);
                    return this._isDurationUnlimited(duration) ? null : duration;
                }
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
    private _setTimeAndUnitFromDuration(duration: moment.Duration) {
        if (this._isDurationUnlimited(duration)) {
            this.unit = DurationUnit.Unlimited;
            this.time = "";
            return;
        }

        const days = duration.asDays();
        const hours = duration.asHours();
        const minutes = duration.asMinutes();
        const seconds = duration.asSeconds();
        if (this._isValidUnit(days)) {
            this.time = days.toString();
            this.unit = DurationUnit.Days;
        } else if (this._isValidUnit(hours)) {
            this.time = hours.toString();
            this.unit = DurationUnit.Hours;
        } else if (this._isValidUnit(minutes)) {
            this.time = minutes.toString();
            this.unit = DurationUnit.Minutes;
        } else if (seconds > 0) {
            // don't check whether second is integer or not, just display whatever this value is
            this.time = seconds.toString();
            this.unit = DurationUnit.Seconds;
        } else {
            this.time = duration.toISOString();
            this.unit = DurationUnit.Custom;
        }
    }

    private _getCustomDuration(time: string) {
        this.invalidCustomDuration = false;

        const duration = moment.duration(time);
        if (time === "P0D") {
            return duration;
        }
        if (duration.toISOString() === "P0D") {
            this.invalidCustomDuration = true;
            return null;
        } else {
            return moment.duration(time);
        }
    }

    private _isValidUnit(value: number) {
        return Number(value) === value && value % 1 === 0 && value > 0;
    }
}
