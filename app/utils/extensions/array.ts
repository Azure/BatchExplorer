// tslint:disable:only-arrow-functions
interface Array<T> {
    /**
     * @returns the first element in an array
     * If array is empty returns undefined
     */
    first(): T;

    /**
     * @returns the last element in an array
     * If array is empty returns undefined
     */
    last(): T;
}

// First, checks if it isn't implemented yet.
if (!Array.prototype.first) {
    Array.prototype.first = function () {
        return this[0];
    };
}
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}
