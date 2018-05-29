import { autobind } from "@batch-flask/core";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

export class WaitForDeletePoller {
    constructor(private getFunction: () => Observable<any>) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        const interval = setInterval(() => {
            this.getFunction().subscribe({
                error: (e) => {
                    progress.next(100);
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, 5000);

        progress.next(-1);

        return obs.asObservable();
    }
}
