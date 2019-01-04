import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { DateTime } from "luxon";
import { Subscription } from "rxjs";

import "./datetime-picker.scss";

let idCounter = 0;

/**
 * DatetimePickerComponent is used in schedule of job schedule
 */
@Component({
    selector: "bl-datetime-picker",
    templateUrl: "datetime-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatetimePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DatetimePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public id = `bl-datetime-picker-${idCounter++}`;
    @Input() public label: string;
    @Input() public timePicker: boolean = true;

    public selectedDate = new FormControl();
    public selectedTime = new FormControl();
    public datetime: FormGroup;
    public currentTimeZone: string;

    private _propagateChange: (value: Date) => void = null;
    private _date: DateTime;
    private _subs: Subscription[] = [];

    constructor(private changeDetector: ChangeDetectorRef, formBuilder: FormBuilder) {
        this.currentTimeZone = new Date().toLocaleTimeString("en-us", {timeZoneName: "short"}).split(" ")[2];

        this.datetime = formBuilder.group({
            date: this.selectedDate,
            time: this.selectedTime,
        });

        this._subs.push(this.selectedDate.valueChanges.subscribe((value: any) => {
            this._date = DateTime.fromJSDate(new Date(value));
            this._setDateTime();
        }));

        this._subs.push(this.selectedTime.valueChanges.subscribe((value: any) => {
            this._setDateTime();
        }));
    }

    public onTimeChange(event) {
        this._setDateTime();
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: Date | string | null): void {
        this._parseDateTime(value);
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

    public trackByFn(index, time: string) {
        return index;
    }

    public get isDatePicked() {
        return Boolean(this._date);
    }

    private _setDateTime() {
        this._setTime();
        if (this._propagateChange) {
            this._propagateChange(this._date.toJSDate());
        }
        this.changeDetector.markForCheck();
    }

    private _setTime() {
        const time = DateTime.fromISO(this.selectedTime.value);
        this._date = this._date.set({
            hour: time.hour,
            minute: time.minute,
        });
    }

    private _parseDateTime(value: Date | string | null) {
        if (!value) {
            return;
        }
        const datetime = this._getDate(value);
        this.selectedDate.setValue(datetime.toJSDate());
        this.selectedTime.patchValue(`${datetime.hour}:${datetime.minute}`);
        this.changeDetector.markForCheck();
    }

    private _getDate(value: Date | string): DateTime {
        if (typeof value === "string") {
            return DateTime.fromISO(value);
        } else {
            return DateTime.fromJSDate(value);
        }
    }
}
