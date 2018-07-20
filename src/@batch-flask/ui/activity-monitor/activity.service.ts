import { Injectable } from "@angular/core";
import { Activity, ActivityProcessor } from "@batch-flask/ui/activity-monitor/activity";

@Injectable()
export class ActivityService {
    private masterProcessor: ActivityProcessor;

    constructor() {
        this.masterProcessor = new ActivityProcessor([]);
    }

    public loadAndRun(activity: Activity) {
        this.masterProcessor.loadAndRun([activity]);
    }
}
