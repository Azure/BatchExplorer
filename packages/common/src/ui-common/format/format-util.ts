import { toIsoLocal } from "../datetime";
import { isArray } from "../util";

/**
 * Automatically formats an object or value type as a friendly string
 *
 * @param value The value or object to format
 *
 * @returns A formatted string
 */
export function autoFormat(value: unknown): string {
    if (value == null) {
        // Null or undefined
        return "";
    } else if (typeof value === "string") {
        // String
        return value;
    } else if (typeof value === "number") {
        // Number
        return String(value);
    } else if (value instanceof Date) {
        // Date
        return toIsoLocal(value);
    } else if (isArray(value)) {
        // Array
        // NOTE: This will flatten nested arrays which isn't ideal
        return value.map((v) => autoFormat(v)).join(", ");
    } else if (value instanceof Object) {
        // Object
        return JSON.stringify(value);
    }
    return String(value);
}
