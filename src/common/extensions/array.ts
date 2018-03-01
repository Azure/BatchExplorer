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

    /**
     * Convert an array of array into an single array.
     * @example [[1, 2], [3, 4]] => [1, 2, 3, 4];
     */
    flatten(): any[];
}

// First, checks if it isn't implemented yet.
if (!Array.prototype.first) {
    Array.prototype.first = function <T>(this: T[]) {
        return this[0];
    };
}
if (!Array.prototype.last) {
    Array.prototype.last = function <T>(this: T[]) {
        return this[this.length - 1];
    };
}

if (!Array.prototype.flatten) {
    Array.prototype.flatten = function <T>(this: T[]) {
        return [].concat(...this);
    };
}
