import { autobind } from "core-decorators";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

// todo: move this somewhere common and hook it up to DeleteJobAction
export class WaitForDeletePoller {
    constructor(private getFunction: any) {
    }

    @autobind()
    public start(progress: BehaviorSubject<any>): Observable<any> {
        const obs = new AsyncSubject();
        const errorCallback = (e) => {
            progress.next(100);
            clearInterval(interval);
            obs.complete();
        };

        let interval = setInterval(() => {
            this.getFunction.fetch().subscribe({
                error: errorCallback,
            });
        }, 5000);

        progress.next(-1);
        this.getFunction.item.subscribe({
            error: errorCallback,
        });

        return obs.asObservable();
    }
}
