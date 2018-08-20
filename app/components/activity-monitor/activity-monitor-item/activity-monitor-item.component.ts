import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { Activity, ActivityStatus } from "@batch-flask/ui/activity-monitor";

import "./activity-monitor-item.scss";

@Component({
    selector: "bl-activity-monitor-item",
    templateUrl: "activity-monitor-item.html",
})
export class ActivityMonitorItemComponent implements OnInit, OnChanges {
    @Input() public activity: Activity;
    @Input() public indent: number = 0;
    @Input() public selected: boolean = false;

    public statusOptions = ActivityStatus;
    public showSubactivities: boolean;

    private _status: ActivityStatus;

    constructor() {
        this._status = null;
    }

    public ngOnInit() {
        this.activity.statusSubject.subscribe(status => {
            this._status = status;
        });
    }

    public ngOnChanges(changes) {
        if (changes.indent) {
            this.indent = changes.indent.currentValue;
        }
        if (changes.selected) {
            this.selected = changes.selected.currentValue;
        }
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

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    public getIndent() {
        return (this.indent * 30) + "px";
    }

    public toggleExpand() {
        this.showSubactivities = !this.showSubactivities;
    }

    public select() {
        console.log("Hi");
        this.selected = true;
    }

    public unselect() {
        this.selected = false;
    }
}
