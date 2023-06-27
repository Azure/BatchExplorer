/**
 * A wrapper around a promise which allows resolving or rejecting
 * at a later point in time with a function call.
 */
export class Deferred<T = void> {
    public promise: Promise<T>;
    public done = false;
    public resolve!: (result: T) => void;
    public reject!: (error: unknown) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.reject = (e) => {
                this.done = true;
                reject(e);
            };
            this.resolve = (r: T) => {
                this.done = true;
                resolve(r);
            };
        });
    }
}
