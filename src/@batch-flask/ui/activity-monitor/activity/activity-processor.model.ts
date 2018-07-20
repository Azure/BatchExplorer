import { BehaviorSubject, Observable, combineLatest } from "rxjs";

import { Activity, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";

interface ActivityQueues {
    pending: Activity[];
    running: Activity[];
    finished: Activity[];
}

export class ActivityProcessor {
    public activityQueues: BehaviorSubject<ActivityQueues>;
    private _activityQueues: ActivityQueues;

    constructor(activities?: Activity[]) {
        this._activityQueues = {
            pending: activities || [],
            running: [],
            finished: [],
        };
        this.activityQueues = new BehaviorSubject(this._activityQueues);
    }

    public loadAndRun(activities: Activity[]): Observable<any> {
        this.enqueue(activities);
        return this.start();
    }

    public enqueue(activities: Activity[]) {
        this._activityQueues.pending.push(...activities);
        this.sendUpdate();
    }

    public start(): Observable<ActivityStatus[]> {
        // note that right now, run returns void (don't worry, it should)
        // You need to return an observable with an array for each status of each activity
        // parent activity will subscribe to this, and when all subactivities complete, parent activity will
        // call statusSubject.next() with its own completion status
        // #Genius
        const observables = this._activityQueues.pending.map(activity => activity.run());
        const obs = combineLatest(observables);
        while (this._activityQueues.pending.length > 0) {
            const activity = this._activityQueues.pending.shift();
            activity.run();
            this._activityQueues.running.push();
        }
        this.sendUpdate();
        return obs;
    }

    //     const observables = this._activityQueues.pending.map(activity => activity.run());
    //     console.log(observables);
    //     const obs = combineLatest(...observables);
    //     while (this._activityQueues.pending.length > 0) {
    //         this._activityQueues.running.push(this._activityQueues.pending.shift());
    //     }
    //     this.sendUpdate();
    //     return obs;

    private sendUpdate() {
        this.activityQueues.next(this._activityQueues);
    }
}
