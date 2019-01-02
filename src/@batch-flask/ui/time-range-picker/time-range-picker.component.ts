import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";

import "./time-range-picker.scss";

export interface TimeRange {
    start?: Date;
    end?: Date;
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
        {label: "Last 24h"},
        {label: "Last week"},
        {label: "Last month"},
    ];
    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public pickQuickRange(value: TimeRange) {

    }
}
