import { Component, OnDestroy, OnInit } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { BehaviorSubject, Subscription } from "rxjs";

import { ActivatedRoute } from "@angular/router";
import "./activity-monitor.scss";

// enum FocusedMonitor {
//     Running,
//     History,
// }

@Component({
    selector: "bl-activity-monitor",
    templateUrl: "activity-monitor.html",
})
export class ActivityMonitorComponent implements OnInit, OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Activity Monitor" };
    }

    public runningActivities: Activity[];
    public pastActivities: Activity[];
    public selectSubject: BehaviorSubject<number>;
    public flashSubject: BehaviorSubject<number>;
    public keyDownSubject: BehaviorSubject<KeyboardEvent>;

    private _sub: Subscription;
    // private _focusedMonitor: FocusedMonitor;

    constructor(
        private activityService: ActivityService,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        this.runningActivities = [];
        this.pastActivities = [];
        // this._focusedMonitor = null;
        this._sub = this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
        this._sub.add(this.activityService.history.subscribe(history => {
            this.pastActivities = history;
        }));
        this._sub.add(this.route.params.subscribe(params => {
            if (params && params.id !== undefined) {
                // this._flash(params.id);
            }
        }));
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public cancelAll() {
        this.activityService.cancelMultiple(this.runningActivities);
    }

    // public focusRunning() {
    //     this._focusedMonitor = FocusedMonitor.Running;
    // }

    // public focusHistory() {
    //     this._focusedMonitor = FocusedMonitor.History;
    // }
}
