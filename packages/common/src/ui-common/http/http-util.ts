import { getEnvironment } from "../environment";
import { HttpClient, HttpHeaders } from "./http-client";

/**
 * Gets the HttpClient for the current environment
 *
 * @returns A logger object
 */
export function getHttpClient(): HttpClient {
    return getEnvironment().getHttpClient();
}

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
