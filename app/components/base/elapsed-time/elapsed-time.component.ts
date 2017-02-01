import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import * as moment from "moment";

import { exists } from "app/utils";

@Component({
    selector: "bex-elapsed-time",
    template: `{{formattedValue}}`,
})
export class ElapsedTimeComponent implements OnInit, OnDestroy {
    public formattedValue = "";

    @Input()
    public set startTime(startTime: Date) {
        this._startTime = startTime;
        this.updateElapsedTime();
    }

    public get startTime() { return this._startTime; }
    @Input()
    public set endTime(endTime: Date) {
        this._endTime = endTime;
        if (exists(this.endTime)) {
            this._clearInterval();
            this.updateElapsedTime();
        }
    }

    public get endTime() { return this._endTime; }

    private _endTime: Date = null;
    private _startTime: Date = null;

    private _refreshInterval: any;

    constructor(private changeDetection: ChangeDetectorRef) {

    }

    public updateElapsedTime() {
        const endTime = this._endTime === null ? moment.utc() : moment.utc(this._endTime);
        const time: any = moment.duration(endTime.diff(moment(this.startTime)));
        this.formattedValue = time.format("d[d] h[h] mm[m] ss[s]");
        this.changeDetection.detectChanges();
    }

    public ngOnInit() {
        this._refreshInterval = setInterval(() => {
            this.updateElapsedTime();
        }, 1000);
    }

    public ngOnDestroy() {
        this._clearInterval();
    }

    private _clearInterval() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
    }
}
