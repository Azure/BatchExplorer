import { Component, Input, OnInit } from "@angular/core";
import { Activity, ActivityStatus } from "@batch-flask/ui/activity-monitor";

import "./activity-monitor-item.scss";

@Component({
    selector: "bl-activity-monitor-item",
    templateUrl: "activity-monitor-item.html",
})
export class ActivityMonitorItemComponent implements OnInit {
    @Input() public activity: Activity;

    public statusOptions = ActivityStatus;

    private _status: ActivityStatus;

    constructor() {
        this._status = null;
    }

    public ngOnInit() {
        this.activity.statusSubject.subscribe(status => {
            this._status = status;
        });
    }

    public get subactivities() {
        return this.activity.subactivities;
    }

    public get status() {
        return this._status;
    }

    public get finished() {
        return this._status === ActivityStatus.Completed ||
            this.status === ActivityStatus.Failed ||
            this.status === ActivityStatus.Canceled;
    }
}
