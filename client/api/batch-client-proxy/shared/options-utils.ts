/**
 * Wrap options for all batch calls to add custom headers.
 * @param options Options
 */
import { BatchResult } from "../models";

export function wrapOptions<T>(options: T): T {
    (options as any).customHeaders = {
        some: "header",
    };
    return options;
}

export function mapGet(promise: Promise<any>): Promise<BatchResult> {
    return promise.then((data) => {
        return { data };
    });
};
