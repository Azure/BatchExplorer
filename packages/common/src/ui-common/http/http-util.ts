import { HttpHeaders } from "./http-client";

/**
 * Type guard to check if an object looks like it implements HttpHeaders
 *
 * @param object The object to check
 *
 * @returns True if the object looks like it implements HttpHeaders, false otherwise.
 */
export function isHttpHeaders(obj: unknown): obj is HttpHeaders {
    if (
        obj &&
        typeof obj === "object" &&
        "append" in obj &&
        "has" in obj &&
        "set" in obj
    ) {
        return true;
    }
    return false;
}
