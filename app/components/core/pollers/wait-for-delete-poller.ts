import { autobind } from "@batch-flask/core";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

export class WaitForDeletePoller {
    constructor(private getFunction: () => Observable<any>) {
    }

    @autobind()
    public start(progress?: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        const interval = setInterval(() => {
            this.getFunction().subscribe({
                error: (e) => {
                    clearInterval(interval);
                    obs.complete();
                },
            });
        }, 5000);

        return obs.asObservable();
    }
}
