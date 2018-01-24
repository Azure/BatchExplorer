import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit,
} from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";

import { DateUtils } from "app/utils";
import { Observable } from "rxjs/Observable";

export enum TimespanDisplayType {
    humanized = "humanized",
    pretty = "pretty",
    compact = "compact",
}
@Component({
    selector: "bl-timespan",
    template: `{{formattedValue}}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimespanComponent implements OnInit, OnChanges, OnDestroy {
    public formattedValue = "";

    @Input() public type: TimespanDisplayType = TimespanDisplayType.pretty;

    @Input() public startTime: Date = null;

    @Input() public endTime: Date = null;

    private _intervalSub: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public ngOnChanges(changes) {
        if (changes.startTime || changes.endTime) {
            this._updateInterval();
            this._updateElapsedTime();
        }
    }

    public _updateElapsedTime() {
        const duration = this._computeTimespan();
        const value = this._formatDuration(duration);
        if (value !== this.formattedValue) {
            this.formattedValue = value;
            this.changeDetector.markForCheck();
        }
    }

    public ngOnInit() {
        this._updateInterval();
    }

    public ngOnDestroy() {
        this._clearInterval();
    }

    private _clearInterval() {
        if (this._intervalSub) {
            this._intervalSub.unsubscribe();
        }
    }

    private _updateInterval() {
        this._clearInterval();
        if (this.startTime && this.endTime) { return; }
        if (!this.startTime && !this.endTime) { return; }

        this._intervalSub = Observable.interval(1000).subscribe(() => {
            this._updateElapsedTime();
        });
    }

    private _computeTimespan() {
        if (!this.startTime && !this.endTime) { return null; }
        const startTime = this.startTime ? moment.utc(this.startTime) : moment.utc();
        const endTime = this.endTime ? moment.utc(this.endTime) : moment.utc();
        return moment.duration(endTime.diff(moment(startTime)));
    }

    private _formatDuration(duration: any) {
        if (!duration) { return null; }
        switch (this.type) {
            case TimespanDisplayType.humanized:
                if (duration.asSeconds() >= 60) {
                    return duration.humanize();
                } else {
                    return DateUtils.prettyDuration(duration);
                }
            case TimespanDisplayType.pretty:
                return DateUtils.prettyDuration(duration);
            case TimespanDisplayType.compact:
            default:
                return DateUtils.compactDuration(duration);
        }
    }
}
