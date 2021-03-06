export class Deferred<T> {
    public promise: Promise<T>;
    public hasCompleted = false;
    public resolve: (v?: T) => void;
    public reject: (e) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.reject = (x) => {
                this.hasCompleted = true;
                reject(x);
            };
            this.resolve = (x: T) => {
                this.hasCompleted = true;
                resolve(x);
            };
        });
    }

}
