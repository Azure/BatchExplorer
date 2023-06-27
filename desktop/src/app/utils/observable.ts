import { AsyncSubject, Observable, of } from "rxjs";

type ObservableBuilder = () => Observable<any>;

export class ObservableUtils {

    /**
     * This will queue a list of function returning an observable.
     * Each function will be called after the previous observable has completed
     * @return List of the output in the order it was given
     *
     * @example
     * const a = () => of("a");
     * const b = () => of("b");
     * const c = () => of("c");
     *
     * ObservableUtils.queue(a, b, c).subscribe(x => {
     * // x is ["a", "b", "c"]
     * })
     */
    public static queue(...callback: ObservableBuilder[]): Observable<any[]> {
        return this._queueNext(callback);
    }

    private static _queueNext(callback: ObservableBuilder[], index: number = 0): Observable<any[]> {
        const subject = new AsyncSubject<any[]>();
        if (index === callback.length) {
            return of([]);
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
