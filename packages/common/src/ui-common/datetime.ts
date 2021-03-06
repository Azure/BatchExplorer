import { Settings, DateTime, Zone } from "luxon";

// Stored so that the timezone can be reset to its original value in unit tests
const initialSystemTimeZone = getSystemTimeZone();

/**
 * Gets the current local time zone.
 * Note: Getting always returns a zone object, so this cast should be safe.
 */
function getSystemTimeZone(): Zone {
    return Settings.defaultZone as Zone;
}

/**
 * Get the current local timezone offset in hours
 *
 * @returns The number of hours of the current timezone offset
 */
export function getLocalTimeZoneOffset(): number {
    const offsetMinutes = getSystemTimeZone().offset(new Date().getTime());
    return offsetMinutes / 60;
}

/**
 * Sets the global timezone offset.
 *
 * @param offset The timezone offset to use (0 for UTC, can be negative).
 *               If null, the local system time zone is reset to its original
 *               value when this module was first loaded.
 */
export function setLocalTimeZoneOffset(offset: number | null = null): void {
    if (offset == null) {
        // Reset to system timezone
        Settings.defaultZone = initialSystemTimeZone;
        return;
    }

    let zone;
    if (offset > 0) {
        zone = `utc+${offset}`;
    } else if (offset < 0) {
        zone = `utc-${Math.abs(offset)}`;
    } else if (offset === 0) {
        zone = "utc";
    } else {
        throw new Error("Invalid time zone offset: " + offset);
    }
    Settings.defaultZone = zone;
}

/**
 * Parses an ISO 8601 formatted string into a Date, preserving
 * the time zone offset
 *
 * @param iso The string to parse
 *
 * @returns A native Date object
 */
export function fromIso(iso: string): Date {
    return DateTime.fromISO(iso).toJSDate();
}

/**
 * Serializes a Date into an ISO 8601 format, using the local
 * time zone.
 *
 * @param date The date to serialize
 *
 * @returns An ISO 8601 date string
 */
export function toIsoLocal(date: Date): string {
    return DateTime.fromJSDate(date).toISO();
}

/**
 * Serializes a Date into an ISO 8601 format, converting to
 * the UTC time zone.
 *
 * @param date The date to serialize
 *
 * @returns An ISO 8601 date string with a UTC time zone
 */
export function toIsoUtc(date: Date): string {
    return DateTime.fromJSDate(date, { zone: "utc" }).toISO();
}

/**
 * Checks if an object is a date type
 *
 * @param obj The object to check
 *
 * @returns True if the object is a date, false otherwise
 */
export function isDate(obj: unknown): obj is Date {
    return obj instanceof Date;
}
