import { Observable, Subscriber, fromEvent } from "rxjs";
import { share, takeUntil } from "rxjs/operators";

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
export function wrapMainObservable<T>(obs: Observable<T>): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
        // This needs to be this way because of how electron IPC works.
        // Get issues if you use `.subscribe(observer)` directly
        const sub = obs.subscribe({
            next: (value) => {
                observer.next(value);
            },
            error: (error) => {
                observer.error(error);
            },
            complete: () => {
                observer.complete();
            },
        });

        return () => {
            sub.unsubscribe();
            observer.complete();
        };
    }).pipe(
        takeUntil(willUnload),
    );
}

export let willUnload: Observable<BeforeUnloadEvent>;

if (typeof window !== "undefined") {
    /**
     * Observable that will emit when the beforeunload event emits
     */
    willUnload = fromEvent(window, "beforeunload").pipe(share());
}
