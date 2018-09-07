import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Activity } from "@batch-flask/ui/activity/activity-types";
import { ActivityService } from "@batch-flask/ui/activity/activity.service";
import { Subscription } from "rxjs";

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
    public pastActivities: Activity[];
    public flashId = null;

    private _sub: Subscription;

    constructor(
        private activityService: ActivityService,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        this.runningActivities = [];
        this.pastActivities = [];
        this._sub = this.activityService.incompleteActivities.subscribe(activities => {
            // copy the array to ensure change detection fires
            this.runningActivities = activities.slice(0);
        });
        this._sub.add(this.activityService.history.subscribe(history => {
            // copy the array to ensure change detection fires
            this.pastActivities = history.slice(0);
        }));
        this._sub.add(this.route.params.subscribe(params => {
            if (params && params.id !== undefined) {
                this.flashId = params.id;
            }
        }));
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public cancelAll() {
        this.activityService.cancelSelection(this.runningActivities);
    }

    public clearHistory() {
        this.activityService.clearHistory();
    }
}
