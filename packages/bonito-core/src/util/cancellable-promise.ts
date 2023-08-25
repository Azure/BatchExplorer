import { CancelledPromiseError } from "../errors";

export interface ICancellablePromise<T> extends Promise<T> {
    cancel: () => void;
}

export function cancellablePromise<T>(p: Promise<T>): ICancellablePromise<T> {
    let cancel: () => void = () => null;
    const promise = new Promise<T>((resolve, reject) => {
        p.then(resolve, reject);
        cancel = () => {
            reject(new CancelledPromiseError("Promise cancelled"));
        };
    }) as ICancellablePromise<T>;

    promise.cancel = cancel;

    return promise;
}
