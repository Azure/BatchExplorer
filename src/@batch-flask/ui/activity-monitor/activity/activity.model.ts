import { AsyncSubject, BehaviorSubject, Observable, Subject, Subscription, combineLatest } from "rxjs";
import { ActivityResponse, ActivityStatus } from "./activity-datatypes";
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
    public subactivities: Activity[];
    public done: AsyncSubject<ActivityStatus>; // only emits on completion
    public isComplete: boolean;
    public pending: boolean;

    private initializer: () => Observable<ActivityResponse | Activity[] | any>;
    private progressSubject: BehaviorSubject<number>;
    private processor: ActivityProcessor;
    private counters: ActivityCounters;
    private subscription: Subscription;

    private progressComplete: Subject<null>;
    private subtasksComplete: Subject<null>;

    constructor(name: string, initializerFn: () => Observable<ActivityResponse | Activity[] | any>) {
        this.id = (Activity.idCounter++).toString();
        this.name = name;
        this.subactivities = [];

        this.isComplete = false;
        this.pending = true;
        this.done = new AsyncSubject<ActivityStatus>();
        this.progressSubject = new BehaviorSubject(-1);

        this.initializer = initializerFn;

        this.processor = new ActivityProcessor();
        this.counters = new ActivityCounters();

        // default all activity progress to pending before executing
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);

        this.subscription = null;

        this.progressComplete = new Subject();
        this.subtasksComplete = new Subject();

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
        this.isComplete = false;
        this.pending = false;
        this.progressSubject.next(0);

        // run the initializer
        this.subscription = this.initializer().subscribe({
            next: result => {
                // if we need to run subtasks, load and run the subtasks
                if (Array.isArray(result)) {
                    // there is no progress to track, so close this observable stream
                    this.progressComplete.complete();

                    // if there is only one activity here, unbox it
                    if (result.length === 1) {
                        this._unboxActivity(result[0]);
                    } else {
                        // otherwise, load and run the processor
                        this.processor.exec(result);
                    }
                } else {
                    // there are no subtasks to track, so close this observable stream
                    this.subtasksComplete.complete();

                    if (result instanceof ActivityResponse) {
                        // update the activity's progress with the response
                        this.progressSubject.next(result.progress);
                    } else {
                        // we're done, mark activity as completed
                        this.progressComplete.complete();
                    }
                }
            },
            complete: () => {
                if (!this.progressComplete.isStopped) {
                    this.progressComplete.complete();
                }
            },
        });

        combineLatest(this.progressComplete, this.subtasksComplete).subscribe({
            complete: () => {
                this._markAsCompleted();
            },
        });
    }

    private _listenToProcessor(): void {
        this.processor.subActivitiesSubject.subscribe(subactivityList => {
            this.subactivities = subactivityList;
        });

        // every time a status is emitted, check against the total number and emit completed if necessary
        this.processor.completionSubject.subscribe(status => {
            // get the number of subactivities for comparison
            const numSubActivities = this.subactivities.length;

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
                this.subtasksComplete.complete();
            }
        });
    }

    /**
     * Sets this activity to be the given activity
     * This is useful when an activity's initializer emits a singleton array of activities
     * We can move that activity "up" in the chain, bypassing the processor for efficiency and better information
     * @param activity the activity to unbox up to this activity
     */
    private _unboxActivity(activity: Activity) {
        // unsubscribe from the initializer
        if (this.subscription && !this.subscription.closed) {
            this.subscription.unsubscribe();
        }

        // set the name and initializer of this activity to be the given activity
        this.name = activity.name;
        this.initializer = activity.initializer;

        this.run();
    }

    /**
     * Marks the activity as completed by emitting completed to the statusSubject
     * Runs the function to be run upon completion of the activity
     */
    private _markAsCompleted(): void {
        this.isComplete = true;

        // emit a completed status to the statusSubject
        this.statusSubject.next(ActivityStatus.Completed);

        // complete the progress subject
        this.progressSubject.next(100);

        // signal completion of this activity
        this.done.next(ActivityStatus.Completed);
        this.done.complete();
    }
}
