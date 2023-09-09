/**
 * A wrapper around a promise which allows resolving or rejecting
 * at a later point in time with a function call.
 */
export class Deferred<T = void> {
    promise: Promise<T>;

    done = false;
    resolved = false;
    rejected = false;
    resolvedTo?: T;
    rejectedTo?: unknown;

    resolve!: (result: T) => void;
    reject!: (error: unknown) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.reject = (e) => {
                this.done = true;
                this.rejected = true;
                this.rejectedTo = e;
                reject(e);
            };
            this.resolve = (r: T) => {
                this.done = true;
                this.resolved = true;
                this.resolvedTo = r;
                resolve(r);
            };
        });
    }
}
