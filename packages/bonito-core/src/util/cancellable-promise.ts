import { CancelledPromiseError } from "../errors";

export interface CancellablePromise<T> extends Promise<T> {
    cancel: () => void;
}

export function cancellablePromise<T>(p: Promise<T>): CancellablePromise<T> {
    let cancel: () => void = () => null;
    const promise = new Promise<T>((resolve, reject) => {
        p.then(resolve, reject);
        cancel = () => {
            reject(new CancelledPromiseError("Promise cancelled"));
        };
    }) as CancellablePromise<T>;

    promise.cancel = cancel;

    return promise;
}
