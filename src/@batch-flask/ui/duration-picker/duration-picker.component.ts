import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewChild,
    forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgControl,
} from "@angular/forms";
import { FlagInput, coerceBooleanProperty } from "@batch-flask/core";
import { MaxDurationValue } from "@batch-flask/core/constants";
import { FormFieldControl } from "@batch-flask/ui/form/form-field";
import { SelectComponent } from "@batch-flask/ui/select";
import { Duration } from "luxon";
import { Subject, Subscription } from "rxjs";

import "./duration-picker.scss";

/**
 * Enumration of time unit picker that can be directly used in luxon
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
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DurationPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationPickerComponent implements FormFieldControl<any>,
    OnInit,
    AfterContentInit,
    ControlValueAccessor,
    OnChanges,
    OnDestroy {

    public DurationUnit = DurationUnit;

    @Input()
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value || this._uid; }

    @Input()
    public label: string;

    @Input() public allowUnlimited: boolean = true;
    @Input() public defaultDuration: string;

    @Input() @FlagInput() public required: boolean = false;

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

    public value: Duration;

    public ngControl: NgControl;
    public time: string = "";
    public unit: DurationUnit = DurationUnit.Unlimited;

    // Validation fields
    public invalidTimeNumber = false;
    public invalidCustomDuration = false;
    public invalidDurationValue = false;

    @HostBinding("attr.aria-describedby")
    public ariaDescribedby: string;

    protected _uid = `bl-input-${nextUniqueId++}`;

    protected _propagateChange: (value: Duration) => void = null;
    protected _duration: Duration;

    @ViewChild("inputEl", { static: false }) private _inputEl: ElementRef;
    @ViewChild(SelectComponent, { static: false }) private _select: SelectComponent;

    private _id: string;
    private _disabled: boolean;
    private _controlSub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private injector: Injector) {
    }

    public ngOnInit() {
        // This is needed here to prevent cirular dependencies
        this.ngControl = this.injector.get(NgControl, null);
    }

    public ngAfterContentInit() {
        // Control properties are not set yet in ngOnInit
        if (this.ngControl) {
            this._controlSub = this.ngControl.statusChanges.subscribe(() => {
                this.changeDetector.markForCheck();
            });
        }
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
    }

    public ngOnChanges(changes) {
        if (changes.allowUnlimited) {
            if (!this.allowUnlimited && this.unit === DurationUnit.Unlimited) {
                this.unit = DurationUnit.Days;
            }
        }
        if (changes.defaultDuration && !this.time) {
            if (this.defaultDuration) {
                this.time = this.defaultDuration;
                this.value = this._getDuration();
            }
        }
        this.stateChanges.next();
    }

    public ngOnDestroy() {
        this.stateChanges.complete();
        if (this._controlSub) {
            this._controlSub.unsubscribe();
        }
    }

    public writeValue(value: Duration | string): void {
        if (value === null || value === undefined) {
            if (this.defaultDuration) {
                this.time = this.defaultDuration;
                this.value = this._getDuration();
            } else {
                this.value = null;
            }
        } else if (value instanceof Duration) {
            this.value = value;
        } else {
            this.value = Duration.fromISO(value);
        }
        this._setTimeAndUnitFromDuration(this.value);
        if (this._propagateChange) {
            this._propagateChange(this.value);
        }
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate() {
        if (this.invalidTimeNumber || this.invalidCustomDuration ||
            this.invalidCustomDuration || (this.required && !this.time)) {
            return {
                duration: "Invalid",
            };
        }
        return null;
    }

    public setDescribedByIds(ids: string[]): void {
        this.ariaDescribedby = ids.join(" ");
    }

    public onContainerClick(event: MouseEvent): void {
        if (this.unit === DurationUnit.Unlimited) {
            this._select.onContainerClick(event);
        } else {
            this._inputEl.nativeElement.focus();
        }
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

    private _getDuration(): Duration {
        this.invalidTimeNumber = false;
        this.invalidCustomDuration = false;
        this.invalidDurationValue = false;

        const currDuration = Duration.fromObject({[this.unit]: Number(this.time)});

        switch (this.unit) {
            case DurationUnit.Custom:
                return this._getCustomDuration(this.time);
            default:
                const time = Number(this.time);
                if (isNaN(time) || time < 0) {
                    this.invalidTimeNumber = true;
                } else if (currDuration > MaxDurationValue) {
                    this.invalidDurationValue = true;
                } else {
                    return currDuration;
                }
        }
        return null;
    }

    /**
     * _setValueAndUnit helps setting constraint duration picker value once constraint form value is patched.
     * Unit is checked from 'days' to 'seconds'. Value will be taken when current unit has an integer value,
     * otherwise next smaller unit will be checked until last unit.
     */
    private _setTimeAndUnitFromDuration(duration: Duration) {
        if (!duration) {
            this.time = "";
            return;
        }
        const days = duration.as("day");
        const hours = duration.as("hour");
        const minutes = duration.as("minute");
        const seconds = duration.as("second");
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
            this.time = duration.toISO();
            this.unit = DurationUnit.Custom;
        }
    }

    private _getCustomDuration(time: string) {
        const duration = Duration.fromISO(time);
        if (time === "P0D") {
            return duration;
        }
        if (!duration.isValid) {
            this.invalidCustomDuration = true;
            return null;
        } else {
            return Duration.fromISO(time);
        }
    }

    private _isValidUnit(value: number) {
        return Number(value) === value && value % 1 === 0 && value > 0;
    }
}
