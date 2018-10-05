/**
 * Base class for an error where the message doesn't contain any personal information.
 * This means the message will be included in the telemetry
 */
export class SanitizedError extends Error {
    constructor(public sanitizedMessage: string) {
        super(sanitizedMessage);
    }
}
