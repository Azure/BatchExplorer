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

    constructor(private activityService: ActivityService) {
        this.runningActivities = [];
    }

    public ngOnInit() {
        this.activityService.incompleteActivities.subscribe(activities => {
            this.runningActivities = activities;
        });
    }

    public trackByFn(index, activity: Activity) {
        return activity.id;
    }
}
