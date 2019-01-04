import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DateTime, Duration } from "luxon";
import { Subject } from "rxjs";

import { DateUtils } from "@batch-flask/utils";
import "./time-range-picker.scss";

export interface TimeRangeAttributes {
    start?: Date | Duration | null;
    end?: Date | Duration | null;
}

export interface QuickRange extends TimeRangeAttributes {
    label: string;
}

export class TimeRange {
    private _start: Date | Duration | undefined | null;
    private _end: Date | Duration | undefined | null;

    constructor(range: TimeRangeAttributes) {
        this._start = range.start;
        this._end = range.end;
    }

    public get start(): Date {
        return this._computeDate(this._start);
    }

    public get end(): Date {
        return this._computeDate(this._end);
    }

    public get duration() {
        return DateTime.fromJSDate(this.end).diff(DateTime.fromJSDate(this.start));
    }

    private _computeDate(value: Date | Duration | undefined | null) {
        if (!value) {
            return new Date();
        } else if (value instanceof Duration) {
            return DateTime.local().plus(value).toJSDate();
        } else {
            return value;
        }
    }
}

// tslint:disable-next-line:variable-name
export const QuickRange = {
    lastHour: { label: "Last hour", start: Duration.fromObject({ hours: -1 }) },
    last24h: { label: "Last 24h", start: Duration.fromObject({ hours: -24 }) },
    lastWeek: { label: "Last week", start: Duration.fromObject({ weeks: -1 }) },
    lastMonth: { label: "Last month", start: Duration.fromObject({ months: -1 }) },
    last90Days: { label: "Last 90 days", start: Duration.fromObject({ days: -90 }) },
};

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
        QuickRange.lastHour,
        QuickRange.last24h,
        QuickRange.lastWeek,
        QuickRange.lastMonth,
        QuickRange.last90Days,
    ];

    public customRange: FormGroup;
    public current: QuickRange | TimeRangeAttributes | null = null;
    public currentLabel: string;

    private _propagateChanges: (value: TimeRange) => void;
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, formBuilder: FormBuilder) {
        this.customRange = formBuilder.group({
            from: [null],
            to: [null],
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

    public pickQuickRange(value: TimeRange | null) {
        this.current = value;
        this.currentLabel = this._computeCurrentRangeLabel();
        this.changeDetector.markForCheck();

        if (this._propagateChanges) {
            this._propagateChanges(new TimeRange(value));
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

        return DateUtils.prettyDate(date);
    }

}
