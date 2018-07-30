import { ActivityProcessor, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";

class ActivityCounters {
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
    public name: string;
    public statusSubject: BehaviorSubject<ActivityStatus>;
    public statusList: ActivityStatus[];

    private initializer: () => Observable<any>;
    private done: () => void;
    private requireSubTask: boolean;
    private processor: ActivityProcessor;
    private numSubActivities: number;
    private counters: ActivityCounters;

    constructor(name: string, requireSubTask: boolean, initializerFn: () => Observable<any>, doneFn?: () => void) {
        this.name = name;
        this.statusList = [];

        // tslint:disable-next-line:no-empty
        this.done = doneFn || (() => {});
        this.initializer = initializerFn;

        this.requireSubTask = requireSubTask;
        this.processor = new ActivityProcessor();
        this.numSubActivities = 0;
        this.counters = new ActivityCounters();

        // default all activity progress to pending before executing
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);

        this._listenToProcessor();
    }

    /**
     * Executes the function supplied in the constructor on this activity
     */
    public run(): void {
        // update status to InProgress
        this.statusSubject.next(ActivityStatus.InProgress);

        // run the initializer
        this.initializer().pipe(
            tap((result) => {
                // if we need to run subtasks, load and run the subtasks
                if (this.requireSubTask) {
                    if (!Array.isArray(result)) {
                        throw new Error("An initializer that requires a subtask must return an Observable<any[]>");
                    }
                    this.numSubActivities = result.length;
                    this.processor.loadAndRun(result);
                } else {
                    // we're done, mark activity as completed
                    this._markAsCompleted();
                }
            }),
        ).subscribe();
    }

    private _listenToProcessor(): void {
        this.processor.statusListSubject.subscribe(statusList => {
            this.statusList = statusList;
        });

        // every time a status is emitted, check against the total number and emit completed if necessary
        this.processor.singleStatusSubject.subscribe(status => {
            if (this.numSubActivities <= 0) {
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

            // in all cases, check the total; if it is equal to the number of subactivities, emit completed
            if (this.counters.total === this.numSubActivities) {
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

        // run the function to be run on completion
        this.done();
    }
}
