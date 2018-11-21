import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import * as moment from "moment";
import { Subscription } from "rxjs";

import "./datetime-picker.scss";

// Currently building a custom dropdown for time, gap is 30 minutes
// Use material datetime picker once time picker is fully supported with timezone
const startHour = 0;
const endHour = 24;
const minutes = ["00", "30"];
const getTimezoneRegex = /\(([^)]+)\)/;

export interface TimeSelectionOption {
    label: string;
    value: string;
}

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

    public timeOptions: TimeSelectionOption[];
    public selectedDate = new FormControl();
    public selectedTime = new FormControl();
    public datetime: FormGroup;
    public currentTimeZone: string;

    private _propagateChange: (value: string) => void = null;
    private _datetime: string;
    private _date: moment.Moment;
    private _subs: Subscription[] = [];

    constructor(private changeDetector: ChangeDetectorRef, formBuilder: FormBuilder) {
        this.timeOptions = this._buildTimeOptions();
        const zoneMatch = getTimezoneRegex.exec(new Date().toString());
        const timeZoneName = Array.isArray(zoneMatch) ? zoneMatch[0] : "";
        this.currentTimeZone = `${moment().format("Z")} ${timeZoneName}`;

        this.datetime = formBuilder.group({
            date: this.selectedDate,
            time: this.selectedTime,
        });

        this._subs.push(this.selectedDate.valueChanges.subscribe((value: any) => {
            this._date = moment(value);
            this._setDateTime();
        }));

        this._subs.push(this.selectedTime.valueChanges.subscribe((value: any) => {
            console.log("Value", value, typeof value);
            this._setDateTime();
        }));
    }

    public onTimeChange(event) {
        this._setDateTime();
    }

    public ngOnDestroy(): void {
        this._subs.forEach(x => x.unsubscribe());
    }

    public writeValue(value: string): void {
        this._datetime = value;
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
        this._datetime = this._date.toISOString();
        if (this._propagateChange) {
            this._propagateChange(this._datetime);
        }
        this.changeDetector.markForCheck();
    }

    private _setTime() {
        const time = moment(this.selectedTime.value, "hh:mm");
        this._date.set({
            hour: time.hour(),
            minute: time.minute(),
        });
    }

    private _parseDateTime(value: string) {
        if (!value) {
            return;
        }
        const datetime = moment(value);
        this.selectedDate.setValue(datetime.toDate());
        this.selectedTime.patchValue(`${datetime.hour()}:${datetime.minute()}`);
        this.changeDetector.markForCheck();
    }

    private _buildTimeOptions(): TimeSelectionOption[] {
        const timeArray: TimeSelectionOption[] = [];
        for (let i = startHour; i < endHour; i++) {
            minutes.forEach(minute => {
                const hour = i > 9 ? "" + i : "0" + i;
                const ampm = i >= 12 ? "PM" : "AM";
                const time = `${hour}:${minute}`;
                const label = `${time} ${ampm}`;
                timeArray.push({
                    value: time,
                    label: label,
                } as TimeSelectionOption);
            });
        }
        return timeArray;
    }
}
