import { Subscription } from "app/models";
import { Observable, Subscriber } from "rxjs";
import { publishReplay, refCount, share } from "rxjs/operators";

/**
 * Function that wraps an observable passed from the main process.
 * You CANNNOT just call pipe on an observable from the main process(IPC doesn't like it)
 * You NEED to use this to wrap the observable first
 *
 *
 * @example
 *
 * // In main process
 * class MyMainService {
 *   public some: Observable<any>
 * }
 *
 * // In renderer
 *
 * class MyRendererService {
 *   public some: Observable<any>;
 *
 *   constructor() {
 *     const mainRef = ... // Retrieve reference to service in main process
 *     this.some = warpMainObs(mainRef.some);
 *   }
 * }
 */
export function warpMainObservable<T>(obs: Observable<T>): Observable<T> {
    const sub: Subscription | null = null;
    return new Observable((observer: Subscriber<T>) => {
        const sub = obs.subscribe(observer);

        const cleanup = () => {
            observer.complete();
            sub.unsubscribe();
        };
        window.addEventListener("beforeunload", cleanup);

        return () => {
            console.log("Unsubscribe");
            sub.unsubscribe();
            observer.complete();
            window.removeEventListener("beforeunload", cleanup);
        };
    }).pipe(
        refCount(),
    );
}
