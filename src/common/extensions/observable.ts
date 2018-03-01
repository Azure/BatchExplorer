import { AsyncSubject, Observable } from "rxjs";

// tslint:disable:only-arrow-functions
declare module "rxjs/Observable" {
    interface Observable<T> {
        /**
         * Will run the given function when the observable complete with the output of the observable
         * @return A new observable that complete when the callback function observable finishes
         *
         * @example
         * Observable.of(1).cascade((count) => {
         *      return Observable.of(count + 1);
         * }).subscribe((result) => logger.log(result)) //=> Result 2
         */
        cascade<TOut>(callback: (data: T) => Observable<TOut> | TOut);
    }
}

if (!Observable.prototype.cascade) {
    Observable.prototype.cascade = function <T>(this: Observable<T>, callback: (data: any) => Observable<any> | any) {
        const subject = new AsyncSubject();
        this.take(1).subscribe({
            next: (data) => {
                const obs = callback(data);
                if (!(obs instanceof Observable)) {
                    subject.next(obs);
                    subject.complete();
                    return;
                }
                obs.take(1).subscribe({
                    next: (out) => {
                        subject.next(out);
                        subject.complete();
                    },
                    error: (e) => subject.error(e),
                });
            },
            error: (e) => subject.error(e),
        });
        return subject.asObservable();
    };
}
