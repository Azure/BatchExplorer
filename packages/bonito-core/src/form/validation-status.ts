/**
 * Represents the result of a given validation
 * VD default to any, to have better type compatibility as it
 * can be initialized with without a data object and assigned
 * to a ValidationSnapshot with a data type.
 */
export class ValidationStatus {
    forced?: boolean = false;

    constructor(
        public level: "ok" | "warn" | "error" | "canceled",
        public message?: string,
        public details?: unknown
    ) {}
}
