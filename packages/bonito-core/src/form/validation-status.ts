/**
 * Represents the result of a given validation
 */
export class ValidationStatus<D = undefined> {
    level: "ok" | "warn" | "error" | "canceled";
    message?: string;
    data?: D;
    forced?: boolean = false;

    constructor(
        level: "ok" | "warn" | "error" | "canceled",
        message?: string,
        data?: D
    ) {
        this.level = level;
        this.message = message;
        this.data = data;
    }
}
