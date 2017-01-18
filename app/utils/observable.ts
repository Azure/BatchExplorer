import { AsyncSubject, Observable } from "rxjs";

type ObservableBuilder = () => Observable<any>;

export class ObservableUtils {
    public static queue(...callback: ObservableBuilder[]): Observable<any[]> {
        return this._queueNext(callback);
    }

    private static _queueNext(callback: ObservableBuilder[], index: number = 0): Observable<any[]> {
        const subject = new AsyncSubject();
        if (index === callback.length) {
            return Observable.of([]);
        }
        callback[index]().subscribe({
            next: (x) => {
                this._queueNext(callback, index + 1).subscribe({
                    next: (output) => {
                        subject.next([x].concat(output));
                        subject.complete();
                    },
                    error: (e) => subject.error(e),
                });
            },
            error: (e) => subject.error(e),
        });

        return subject.asObservable();
    }
}
