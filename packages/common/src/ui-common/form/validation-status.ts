/**
 * Represents the result of a given validation
 */
export class ValidationStatus {
    level: "ok" | "warn" | "error" | "canceled";
    message?: string;
    forced?: boolean = false;

    constructor(level: "ok" | "warn" | "error" | "canceled", message?: string) {
        this.level = level;
        this.message = message;
    }
}
