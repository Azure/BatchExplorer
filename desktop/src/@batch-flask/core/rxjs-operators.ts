import { NgZone } from "@angular/core";
import { Observable } from "rxjs";

export function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
    return input != null;
}

/**
 * Make the observable run in Angular zone. To be used when events are emitted by library not patched by Zone.js.
 * Electron for example
 * @param zone Angular zone
 */
export function enterZone(zone: NgZone) {
    return <T>(source: Observable<T>): Observable<T> =>
        new Observable<T>(observer =>
            source.subscribe({
                next: (x) => zone.run(() => observer.next(x)),
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            }),
        );
}
