import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { BehaviorSubject, Subscription } from "rxjs";

import "./activity-monitor.scss";

@Component({
    selector: "bl-activity-monitor",
    templateUrl: "activity-monitor.html",
})
export class ActivityMonitorComponent implements OnInit, OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Activity Monitor" };
    }

    public runningActivities: Activity[];
    public selectSubject: BehaviorSubject<number>;
    public keyDownSubject: BehaviorSubject<KeyboardEvent>;

    private _sub: Subscription;

    constructor(private activityService: ActivityService) {
        this.runningActivities = [];
        this.selectSubject = new BehaviorSubject(0);
        this.keyDownSubject = new BehaviorSubject(null);
    }

    public ngOnInit() {
        this._sub = this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    /* Key Navigation */
    @HostListener("window:keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.keyDownSubject.next(event);
    }
}
