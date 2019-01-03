import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import { FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";

import "./time-range-picker.scss";

export interface TimeRangeAttributes {
    start?: Date;
    end?: Date;
}

export class TimeRange {
    private _start: Date | undefined;
    private _end: Date | undefined;
    constructor(range: TimeRangeAttributes) {
        this._start = range.start;
        this._end = range.end;
    }
    public get start(): Date {
        return null;

    }

    public get end(): Date {
        return null;
    }
}

@Component({
    selector: "bl-time-range-picker",
    templateUrl: "time-range-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimeRangePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => TimeRangePickerComponent), multi: true },
    ],
})
export class TimeRangePickerComponent {
    public quickRanges = [
        { label: "Last 24h" },
        { label: "Last week" },
        { label: "Last month" },
    ];
    public customRange: FormGroup;

    constructor(private changeDetector: ChangeDetectorRef, formBuilder: FormBuilder) {
        this.changeDetector.markForCheck();
        this.customRange = formBuilder.group({
            from: [null],
            to: [null],
        });
    }

    public pickQuickRange(value: TimeRange) {

    }
}
