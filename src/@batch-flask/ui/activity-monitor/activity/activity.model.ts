import { ActivityProcessor, ActivityStatus } from "@batch-flask/ui/activity-monitor/activity";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";

export class Activity {
    public name: string;
    public statusSubject: BehaviorSubject<ActivityStatus>;

    private initializer: () => Observable<any>;
    private requireSubTask: boolean;
    private processor: ActivityProcessor;

    constructor(name: string, requireSubTask: boolean, initializerFn: () => Observable<any>) {
        this.name = name;
        this.requireSubTask = requireSubTask;
        this.initializer = initializerFn;
        this.processor = new ActivityProcessor();

        // default all activity progress to pending before executing
        this.statusSubject = new BehaviorSubject(ActivityStatus.Pending);
    }

    /**
     * Executes the function supplied in the constructor on this activity
     */
    public run(): void {
        // update status to InProgress
        // this.statusSubject.next(ActivityStatus.InProgress);

        // run the initializer
        this.initializer().pipe(
            map((result) => {
                if (this.requireSubTask) {
                    this.processor.loadAndRun(result).subscribe(next => {
                        console.log(next);
                    });
                } else {
                    // we're done, emit completed
                    this.sendUpdate(ActivityStatus.Completed);
                }
            }),
        );
    }

    /**
     * Emits a status via statusSubject to any subscribers
     * @param status
     */
    private sendUpdate(status) {
        this.statusSubject.next(status);
    }
}
