// Importing specific modules instead of importing all of "lodash" gives us
// better tree shaking and a smaller bundle size
import lodashCloneDeep from "lodash/cloneDeep";

import { getEnvironment } from "./environment";

export function uniqueId(prefix: string = "id"): string {
    const env = getEnvironment();
    return `${prefix}-${env.uniqueId()}`;
}

export function cloneDeep<T>(target: T): T {
    return lodashCloneDeep(target) as T;
}

/**
 * Type guard for Promise objects
 * @param obj The object to test
 * @returns True if the object looks like a promise, false otherwise
 */
export function isPromise(obj: unknown): obj is Promise<unknown> {
    if (obj && typeof obj === "object" && "then" in obj) {
        return true;
    }
    return false;
}
