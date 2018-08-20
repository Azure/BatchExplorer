import { Component, OnInit } from "@angular/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";

import "./activity-monitor.scss";

@Component({
    selector: "bl-activity-monitor",
    templateUrl: "activity-monitor.html",
})
export class ActivityMonitorComponent implements OnInit {
    public static breadcrumb(params, queryParams) {
        return { name: "Activity Monitor" };
    }

    public runningActivities: Activity[];
    public activeId: number;

    constructor(private activityService: ActivityService) {
        this.runningActivities = [];
        this.activeId = 0;
    }

    public ngOnInit() {
        this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }

    public setActive(activity) {
        this.activeId = activity.id;
    }
}
