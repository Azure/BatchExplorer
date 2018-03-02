import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormControl,
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

/**
 * DatetimePickerComponent is used in schedule of job schedule
 */
@Component({
    selector: "bl-datetime-picker",
    templateUrl: "datetime-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatetimePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => DatetimePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatetimePickerComponent implements ControlValueAccessor, OnDestroy {
    @Input() public label: string;
    @Input() public timePicker: boolean = true;
    public timeOptions: TimeSelectionOption[];
    public selectedDate: FormControl;
    public selectedTime: string;
    public currentTimeZone: string;

    private _propagateChange: (value: string) => void = null;
    private _datetime: string;
    private _date: moment.Moment;
    private _sub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.timeOptions = this._buildTimeOptions();
        this.selectedDate = new FormControl();
        const zoneMatch = getTimezoneRegex.exec(new Date().toString());
        const timeZoneName = Array.isArray(zoneMatch) ? zoneMatch[0] : "";
        this.currentTimeZone = `${moment().format("Z")} ${timeZoneName}`;
        this._sub = this.selectedDate.valueChanges.subscribe((value: any) => {
            this._date = moment(value);
            if (!this.selectedTime) {
                this.selectedTime = this.timeOptions[0].value;
            }
            this._setDateTime();
        });
    }

    public onTimeChange(event) {
        this._setDateTime();
    }

    public ngOnDestroy(): void {
        if (this._sub) {
            this._sub.unsubscribe();
        }
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
        const time: moment.Moment = moment(this.selectedTime, "HH:mm");
        this._date.set({
            hour: time.get("hour"),
            minute: time.get("minute"),
        });
    }

    private _parseDateTime(value: string) {
        if (!value) {
            return;
        }
        const datetime = moment(value);
        this.selectedDate.setValue(datetime.toDate());
        this.selectedTime = datetime.format("HH:mm");
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
