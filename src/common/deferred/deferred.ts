export class Deferred<T> {
    public promise: Promise<T>;
    public resolve: (v: T) => void;
    public reject: (e) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
