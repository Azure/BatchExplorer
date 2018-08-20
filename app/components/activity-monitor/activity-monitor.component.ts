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
    public selectedId: number;

    // /**
    //  * tracks the visible state of the monitor
    //  * if two activities are visible (ids 1 and 4)
    //  * and if activity 1 has two subactivities visible (ids 2 and 3)
    //  * then monitor state is [1, [2, 3], 4]
    //  */
    // private monitorState: any[];

    constructor(private activityService: ActivityService) {
        this.runningActivities = [];
        this.selectedId = 0;
        // this.monitorState = [];
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
