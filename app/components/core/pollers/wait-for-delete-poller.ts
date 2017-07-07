import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

// todo: Hook up to DeleteJobAction, DeleteTaskAction
export class WaitForDeletePoller {
    constructor(private getFunction: any) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        let interval = setInterval(() => {
            this.getFunction.fetch().subscribe({
                error: (e) => {
                    progress.next(100);
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, 5000);

        progress.next(-1);

        return obs;
    }
}
