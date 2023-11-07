/**
 * Represents the result of a given validation
 */
export class ValidationStatus {
    forced?: boolean = false;

    constructor(
        public level: "ok" | "warn" | "error" | "canceled",
        public message?: string,
        // TODO: Make this a generic type
        public details?: unknown
    ) {}
}
