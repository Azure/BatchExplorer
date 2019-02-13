import { NgZone } from "@angular/core";
import { Observable, Subscriber, fromEvent } from "rxjs";
import { share, takeUntil } from "rxjs/operators";

/**
 * Function that wraps an observable passed from the main process.
 * You CANNNOT just call pipe on an observable from the main process(IPC doesn't like it)
 * You NEED to use this to wrap the observable first
 * @param obs: Observable that is defined in the main process
 * @param zone: Angular zone so the change detection is triggererd correctly
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
 *   constructor(zone: NgZone) {
 *     const mainRef = ... // Retrieve reference to service in main process
 *     this.some = warpMainObs(mainRef.some, zone);
 *   }
 * }
 */
export function wrapMainObservable<T>(obs: Observable<T>, zone: NgZone): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
        // This needs to be this way because of how electron IPC works.
        // Get issues if you use `.subscribe(observer)` directly

        const sub = obs.subscribe({
            next: (value) => {
                zone.run(() => observer.next(value));
            },
            error: (error) => {
                zone.run(() => observer.error(error));
            },
            complete: () => {
                zone.run(() => observer.complete());
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

/**
 * Observable that emit when the window is about to be unloaded(Refresh/Close)
 * @example
 *
 * myObs.pipe(takeUntil(willUnload)).subscribe(() => {
 *
 * })
 */
export let willUnload: Observable<BeforeUnloadEvent>;

if (typeof window !== "undefined") {
    /**
     * Observable that will emit when the beforeunload event emits
     */
    willUnload = fromEvent(window, "beforeunload").pipe(share());
}
