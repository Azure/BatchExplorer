import { Settings, DateTime } from "luxon";

const systemTimeZone = Settings.defaultZone;

export function getLocalTimeZoneOffset(): number {
    const now = new Date().getTime();
    return (
        (Settings.defaultZone.offset(now) ?? systemTimeZone.offset(now)) / 60
    );
}

/**
 * Sets the global timezone offset.
 *
 * @param offset The timezone offset to use (0 for UTC, can be negative).
 *               If null, the local system time zone is used.
 */
export function setLocalTimeZoneOffset(offset: number | null = null): void {
    if (offset == null) {
        // Reset to system timezone
        Settings.defaultZoneName = systemTimeZone.name;
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
    Settings.defaultZoneName = zone;
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
