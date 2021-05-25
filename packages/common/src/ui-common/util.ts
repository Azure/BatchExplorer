// Importing specific modules instead of importing all of "lodash" gives us
// better tree shaking and a smaller bundle size
import lodashCloneDeep from "lodash/cloneDeep";
import lodashIsArray from "lodash/isArray";

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
