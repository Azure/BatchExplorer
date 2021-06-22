// Importing specific modules instead of importing all of "lodash" gives us
// better tree shaking and a smaller bundle size
import lodashCloneDeep from "lodash/cloneDeep";
import lodashIsArray from "lodash/isArray";
import lodashDebounce from "lodash/debounce";

import { getEnvironment } from "./environment";

export function uniqueId(prefix: string = "id"): string {
    const env = getEnvironment();
    return `${prefix}-${env.uniqueId()}`;
}

export function cloneDeep<T>(target: T): T {
    return lodashCloneDeep(target) as T;
}

/**
 * Check if the passed-in object looks like a promise
 * @param obj The object to test
 * @returns True if the object looks like a promise, false otherwise
 */
export function isPromiseLike(obj: unknown): obj is Promise<unknown> {
    if (
        obj &&
        typeof obj === "object" &&
        "then" in obj &&
        // KLUDGE: Typescript may handle this in the future.
        //         See: https://github.com/Microsoft/TypeScript/issues/21732
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof obj.then === "function"
    ) {
        return true;
    }
    return false;
}

/**
 * Check if the passed-in object is an array
 * @param obj The object to check
 * @returns True if the object is an array, false otherwise
 */
export function isArray(obj: unknown): obj is Array<unknown> {
    return lodashIsArray(obj);
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
    /**
     * Call the original function and return its return value, or the most
     * recent return value if the function should not yet be run. If the function
     * has never been run, returns undefined.
     */
    (...args: Parameters<T>): ReturnType<T> | undefined;

    /**
     * Cancel any pending invokation of the debounced function
     */
    cancel(): void;

    /**
     * If there is a pending invokation, invoke it immediately and return its
     * return value. Otherwise return the most recent return value, or undefined
     * if the function was never run.
     */
    flush(): ReturnType<T> | undefined;
}

/**
 * Creates a debounce function which delays a certain amount of time before
 * invoking the passed-in function.
 *
 * Note: If both leading and trailing options are true, the function is invoked
 *       at the trailing edge of the interval only if it was invoked more than
 *       once during the interval.
 *
 * Intended to remain API-compatible with https://lodash.com/docs/4.17.15#debounce
 * even if we remove lodash as a dependency.
 *
 * @param callback
 * @returns A version of the passed-in function which executes on a delay, and
 *          has additional methods for canceling/flushing any pending executions.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(callback: T, wait?: number, opts?: {
    /**
     * Invoke the function at the beginning of the interval
     */
    leading?: boolean;

    /**
     * Invoke the function at the end of the interval
     */
    trailing?: boolean;

    /**
     * After a certain amount of time, invoke the function no matter what
     */
    maxWait?: number;
}): DebouncedFunction<T> {
    return lodashDebounce(callback, wait, opts);
}

/**
 * Return a promise which resolves after a certain number of milliseconds
 * @param ms The number of milliseconds to delay
 * @returns A promise which resolves when the delay is finished
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}
