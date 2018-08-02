import { Injectable } from "@angular/core";
import { Activity, ActivityProcessor, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";
import { Observable, forkJoin, of } from "rxjs";
import { flatMap } from "rxjs/operators";

@Injectable()
export class ActivityService {
    public statusList: any[];

    private masterProcessor: ActivityProcessor;

    constructor() {
        this.masterProcessor = new ActivityProcessor();
        this.statusList = [];
    }

    /**
     * Loads a single activity into the master processor, and runs the processor
     * N.B. this method is cascadable, in case it needs to be chained with done()
     * @param activity the activity to load into the master processor
     */
    public loadAndRun(activity: Activity): ActivityService {
        this.masterProcessor.loadAndRun([activity]);
        return this;
    }

    public done(): Observable<ActivityStatus> {
        const doneObservables = this.masterProcessor.activities.map(activity => activity.done.asObservable());
        return forkJoin(...doneObservables).pipe(
            flatMap(obs => {
                return of(ActivityStatus.Completed);
            }),
        );
    }
}
