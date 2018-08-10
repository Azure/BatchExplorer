import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ActivityResponse, ActivitySnapshot, ActivityStatus } from "./activity-datatypes";
import { ActivityProcessor } from "./activity-processor.model";

export class ActivityCounters {
    public completed: number;
    public failed: number;
    public canceled: number;

    public get total(): number {
        return this.completed + this.failed + this.canceled;
    }

    constructor() {
        this.completed = 0;
        this.failed = 0;
        this.canceled = 0;
    }
}

export class Activity {
    public static idCounter: number = 0;

    public id: string;
    public name: string;
    public statusSubject: BehaviorSubject<ActivityStatus>;
    public snapshots: ActivitySnapshot[];
    public done: AsyncSubject<ActivityStatus>; // only emits on completion
    public pending: boolean;

    private initializer: () => Observable<ActivityResponse | Activity[] | any>;
    private progressSubject: BehaviorSubject<number>;
    private processor: ActivityProcessor;
    private counters: ActivityCounters;

    constructor(name: string, initializerFn: () => Observable<any>) {
        this.id = (Activity.idCounter++).toString();
        this.name = name;
        this.snapshots = [];

        this.pending = true;
        this.done = new AsyncSubject<ActivityStatus>();
        this.progressSubject = new BehaviorSubject(-1);

        this.initializer = initializerFn;

        this.processor = new ActivityProcessor();
        this.counters = new ActivityCounters();

        // default all activity progress to pending before executing
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);

        this._listenToProcessor();
    }

    public get progress() {
        return this.progressSubject.asObservable();
    }

    /**
     * Executes the function supplied in the constructor on this activity
     */
    public run(): void {
        // update status to InProgress
        this.statusSubject.next(ActivityStatus.InProgress);
        this.pending = false;
        this.progressSubject.next(0);

        // run the initializer
        this.initializer().pipe(
            tap((result) => {
                // if we need to run subtasks, load and run the subtasks
                if (Array.isArray(result)) {
                    this.processor.loadAndRun(result);
                } else if (result instanceof ActivityResponse) {
                    // update the activity's progress with the response
                    this.progressSubject.next(result.progress);
                    if (result.progress === 100) {
                        this._markAsCompleted();
                    }
                } else {
                    // we're done, mark activity as completed
                    this._markAsCompleted();
                }
            }),
        ).subscribe();
    }

    private _listenToProcessor(): void {
        this.processor.snapshotsSubject.subscribe(statusList => {
            this.snapshots = statusList;
        });

        // every time a status is emitted, check against the total number and emit completed if necessary
        this.processor.completionSubject.subscribe(status => {
            // get the number of subactivities for comparison
            const numSubActivities = this.processor.activities.length;

            if (numSubActivities <= 0) {
                return;
            }

            switch (status) {
                case ActivityStatus.Completed:
                    this.counters.completed++;
                    break;
                case ActivityStatus.Failed:
                    this.counters.failed++;
                    break;
                case ActivityStatus.Canceled:
                    this.counters.canceled++;
                    break;
                default:
                    break;
            }

            this.progressSubject.next((this.counters.total / numSubActivities) * 100);

            // in all cases, check the total; if it is equal to the number of subactivities, emit completed
            if (this.counters.total === numSubActivities) {
                this._markAsCompleted();
            }
        });
    }

    /**
     * Marks the activity as completed by emitting completed to the statusSubject
     * Runs the function to be run upon completion of the activity
     */
    private _markAsCompleted(): void {
        // emit a completed status to the statusSubject
        this.statusSubject.next(ActivityStatus.Completed);

        // signal completion of this activity
        this.done.next(ActivityStatus.Completed);
        this.done.complete();
    }
}
