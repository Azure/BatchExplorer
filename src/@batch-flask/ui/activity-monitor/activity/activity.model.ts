import { AsyncSubject, BehaviorSubject, Observable, Subscription, merge } from "rxjs";
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

    public id: number;
    public name: string;
    public statusSubject: BehaviorSubject<ActivityStatus>;
    public progressSubject: BehaviorSubject<number>;
    public subactivities: Activity[];
    /** Emits on completion, with the status of the activity after completion */
    public done: AsyncSubject<ActivityStatus>;
    public isComplete: boolean;
    public pending: boolean;
    public initializer: () => Observable<ActivityResponse | Activity[] | any>;
    public isCancellable: boolean;
    public error: string;

    private processor: ActivityProcessor;
    private counters: ActivityCounters;
    private subtasksComplete: AsyncSubject<null>;
    private awaitCompletionSub: Subscription;

    constructor(name: string, initializerFn: () => Observable<ActivityResponse | Activity[] | any>) {
        this.id = Activity.idCounter++;
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

        this.subtasksComplete = new AsyncSubject();

        this.isCancellable = true;

        this.error = "";

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
        const initializerObs = this.initializer();
        initializerObs.subscribe({
            next: result => {
                // if we need to run subtasks, execute the subtasks
                if (Array.isArray(result)) {
                    // check if any children are not cancellable
                    // (this will also make the current activity uncancellable)
                    if (result.filter(act => !act.isCancellable).length > 0) {
                        this.setUncancellable();
                    }
                    this.processor.exec(result);
                } else {
                    // there are no subtasks to track, so close this observable stream
                    this.subtasksComplete.complete();

                    if (result instanceof ActivityResponse) {
                        // update the activity's progress with the response
                        this.progressSubject.next(result.progress);
                    }
                }
            },
            error: (err) => {
                this._markAsFailed(err);
            },
        });

        this.awaitCompletionSub = merge(initializerObs, this.subtasksComplete).subscribe({
            complete: () => {
                this._markAsCompleted();
            },
        });
    }

    /**
     * Sets an activity as not cancellable
     * Chainable; can be used with constructors
     */
    public setUncancellable(): Activity {
        this.isCancellable = false;

        return this;
    }

    /**
     * Immediately stops the running function and completes the activity
     */
    public cancel(): void {
        if (!this.isCancellable) { return; }
        // if we have an awaitCompletionSub active subscription, unsubscribe from it
        // so we don't get an automatic Completed when the subactivities finish
        if (this.awaitCompletionSub && !this.awaitCompletionSub.closed) {
            this.awaitCompletionSub.unsubscribe();
        }

        this._markAsCancelled();
        for (const activity of this.subactivities) {
            activity.cancel();
        }
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
                case ActivityStatus.Cancelled:
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

        this.processor.combinedProgressSubject.subscribe(progress => {
            this.progressSubject.next(progress);
        });
    }

    /**
     * Marks the activity as completed by emitting Completed to the statusSubject
     * Also marks the activity as done by completing its done async subject
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

    /**
     * Marks the activity as cancelled (a type of completion) by emitting Cancelled to the statusSubject
     * Also marks the activity as done by completing its done async subject
     */
    private _markAsCancelled() {
        this.isComplete = true;

        // emit a cancelled status to the statusSubject
        this.statusSubject.next(ActivityStatus.Cancelled);

        // leave the progress subject as is

        // signal completion of the activity
        this.done.next(ActivityStatus.Cancelled);
        this.done.complete();
    }

    /**
     * Marks the activity as failed (a type of completion) by emitting Failed to the statusSubject
     * Also marks the activity as done by completing its done async subject
     */
    private _markAsFailed(withError: Error) {
        this.isComplete = true;

        // emit a cancelled status to the statusSubject
        this.statusSubject.next(ActivityStatus.Failed);

        // leave the progress subject as is

        // attach the reported error to this activity
        this.error = `Activity Failed During Initializer with Error: ${withError.message}`;

        // signal completion of the activity
        this.done.next(ActivityStatus.Failed);
        this.done.complete();
    }
}
