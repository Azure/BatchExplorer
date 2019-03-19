import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { TimeZone, TimeZoneService } from "@batch-flask/core";
import { DateTime } from "luxon";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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

    public datetime: FormGroup;
    public currentTimeZone: TimeZone;

    private _datetime = null;
    private _propagateChange: (value: Date) => void = null;
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private timezoneService: TimeZoneService,
        formBuilder: FormBuilder,
    ) {
        this.timezoneService.current.pipe(takeUntil(this._destroy)).subscribe((current) => {
            this.currentTimeZone = current;
            this.changeDetector.markForCheck();
        });

        this.datetime = formBuilder.group({
            date: [null],
            time: [null],
        });

        this.datetime.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
            const time = value.time ? DateTime.fromISO(value.time) : null;
            const date = DateTime.fromJSDate(value.date, {
                zone: this.currentTimeZone.name,
            }).set({
                hour: time ? time.hour : 0,
                minute: time ? time.minute : 0,
            });

            if (this._propagateChange && date.isValid) {
                const jsDate = date.toJSDate();
                if (!this._datetime || jsDate.getTime() !== this._datetime.getTime()) {
                    this._datetime = jsDate;
                    this._propagateChange(jsDate);
                }
            }
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
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

    private _parseDateTime(value: Date | string | null) {
        if (!value) {
            return;
        }
        const datetime = this._getDate(value).setZone(this.currentTimeZone.name);
        this.datetime.patchValue({
            date: datetime.toJSDate(),
            time: `${datetime.hour}:${datetime.minute}`,
        });
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
