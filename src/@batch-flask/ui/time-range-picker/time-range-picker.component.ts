import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ValidationErrors } from "@angular/forms";
import { DateTime, Duration } from "luxon";
import { Subject } from "rxjs";

import { I18nService } from "@batch-flask/core";
import { DateUtils } from "@batch-flask/utils";
import "./time-range-picker.scss";

export interface TimeRangeAttributes {
    start?: Date | Duration | null;
    end?: Date | Duration | null;
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

export class QuickRange extends TimeRange {
    public label: string;

    constructor(data: { label: string } & TimeRangeAttributes) {
        super(data);
        this.label = data.label;
    }
}

// tslint:disable-next-line:variable-name
export const QuickRanges = {
    lastHour: new QuickRange({ label: "Last hour", start: Duration.fromObject({ hours: -1 }) }),
    last24h: new QuickRange({ label: "Last 24h", start: Duration.fromObject({ hours: -24 }) }),
    lastWeek: new QuickRange({ label: "Last week", start: Duration.fromObject({ weeks: -1 }) }),
    lastMonth: new QuickRange({ label: "Last month", start: Duration.fromObject({ months: -1 }) }),
    last90Days: new QuickRange({ label: "Last 90 days", start: Duration.fromObject({ days: -90 }) }),
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
        QuickRanges.lastHour,
        QuickRanges.last24h,
        QuickRanges.lastWeek,
        QuickRanges.lastMonth,
        QuickRanges.last90Days,
    ];

    public customRange: FormGroup;
    public current: QuickRange | TimeRangeAttributes | null = null;
    public currentLabel: string;

    private _propagateChanges: (value: TimeRange) => void;
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private i18n: I18nService, formBuilder: FormBuilder) {
        this.customRange = formBuilder.group(
            {
                start: [null],
                end: [null],
            },
            {
                validators: [this._validateCustomRange.bind(this)],
            },
        );
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
