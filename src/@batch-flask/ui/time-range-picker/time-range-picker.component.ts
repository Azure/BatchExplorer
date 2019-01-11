import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ValidationErrors } from "@angular/forms";
import { I18nService, TimeZoneService } from "@batch-flask/core";
import { DateUtils } from "@batch-flask/utils";
import { DateTime, Duration } from "luxon";
import { Subject } from "rxjs";
import { QuickRange, QuickRanges, TimeRange, TimeRangeAttributes } from "./time-range.model";

import { takeUntil } from "rxjs/operators";
import "./time-range-picker.scss";

let idCounter = 0;

@Component({
    selector: "bl-time-range-picker",
    templateUrl: "time-range-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimeRangePickerComponent), multi: true },
    ],
})
export class TimeRangePickerComponent implements ControlValueAccessor, OnDestroy {
    @HostBinding("attr.id") public id = `bl-timerange-picker-${idCounter++}`;

    public quickRanges: QuickRange[] = [
        QuickRanges.lastHour,
        QuickRanges.last24h,
        QuickRanges.lastWeek,
        QuickRanges.lastMonth,
        QuickRanges.last90Days,
    ];

    public customRange: FormGroup;
    public current: QuickRange | TimeRangeAttributes | null = null;
    public currentLabel: string;
    public _currentTimezone: string;

    private _propagateChanges: (value: TimeRange) => void;
    private _destroy = new Subject();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private i18n: I18nService,
        timezoneService: TimeZoneService,
        formBuilder: FormBuilder) {
        this.customRange = formBuilder.group(
            {
                start: [null],
                end: [null],
            },
            {
                validators: [this._validateCustomRange.bind(this)],
            },
        );

        timezoneService.current.pipe(takeUntil(this._destroy)).subscribe((current) => {
            this._currentTimezone = current.name;
            this._computeCurrentRangeLabel();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public pickCustomRange() {
        const value = this.customRange.value;
        this.current = value;
        this.currentLabel = this._computeCurrentRangeLabel();
        if (this._propagateChanges) {
            this._propagateChanges(new TimeRange(value));
        }
        this.changeDetector.markForCheck();

        if (this._propagateChanges) {
            this._propagateChanges(new TimeRange(value));
        }
    }

    public pickQuickRange(value: QuickRange | null) {
        this.current = value;
        this.currentLabel = this._computeCurrentRangeLabel();
        this.changeDetector.markForCheck();

        if (this._propagateChanges) {
            this._propagateChanges(value);
        }
    }

    public writeValue(range: TimeRange | QuickRange): void {
        if (!range) {
            return;
        }
        if (range instanceof TimeRange) {
            if (range.start instanceof Date) {
                this.customRange.patchValue({
                    start: range.start,
                }, { emitEvent: false });
            }
            if (range.end instanceof Date) {
                this.customRange.patchValue({
                    end: range.end,
                }, { emitEvent: false });
            }
        }
        this.current = range;
        this.currentLabel = this._computeCurrentRangeLabel();
        this.changeDetector.markForCheck();
    }

    public registerOnChange(fn: (value: TimeRange | null) => void): void {
        this._propagateChanges = fn;

    }

    public registerOnTouched(fn: any): void {
        // Nothing
    }

    public trackQuickRange(_: number, range: QuickRange) {
        return range.label;
    }

    private _computeCurrentRangeLabel() {
        if (!this.current) {
            return "-";
        }

        if ("label" in this.current) {
            return this.current.label;
        }

        const startStr = this._prettyPoint(this.current.start);
        const endStr = this._prettyPoint(this.current.end);

        return `${startStr} - ${endStr}`;
    }

    private _prettyPoint(date: Date | Duration | undefined | null) {
        if (!date) { return "Now"; }

        if (date instanceof Duration) {
            return DateTime.local().plus(date).toRelative();
        }

        return DateUtils.prettyDate(DateTime.fromJSDate(date).setZone(this._currentTimezone));
    }

    private _validateCustomRange(c: FormGroup): ValidationErrors {
        let { start, end } = c.value;
        if (!start && !end) {
            return {
                invalidRange: {
                    message: this.i18n.t("time-range-picker.errors.required"),
                },
            };
        }

        start = start || new Date();
        end = end || new Date();

        if (start.getTime() >= end.getTime()) {
            return {
                invalidRange: {
                    message: this.i18n.t("time-range-picker.errors.invalidRange"),
                },
            };
        }

        return null;
    }
}
