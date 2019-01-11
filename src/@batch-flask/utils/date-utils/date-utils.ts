import { DateTime, Duration, DurationObject, DurationUnit } from "luxon";

export class DateUtils {
    /**
     * Check if the given date is withing the range of the last amount of unit given
     * @param date Date to Check
     * @param amount Amount of given unit
     * @param unit {DurationUnit} from luxon
     *
     * @example withinRange(date, 3, "days") // Check if date is less than 3 days old
     */
    public static withinRange(date: Date | DateTime, amount: number, unit: DurationUnit) {
        if (!(date instanceof DateTime)) {
            date = DateTime.fromJSDate(date);
        }
        return DateTime.local().diff(date).as(unit) < amount;
    }

    /**
     * Return a short presentable date.
     * This will return a relative time if less that 20 days older
     * Otherwhise will print only the date in a readable way
     *
     * @param date Date to display
     * @param prettyDateRelativeRange Max number of days to use relative time
     *
     * @example
     * - 2 hours ago
     * - Feb 2, 2016
     * - Nob 12, 2015
     */
    public static prettyDate(date: Date | DateTime, prettyDateRelativeRange = 20): string {
        if (!date) {
            return "";
        }

        if (!(date instanceof DateTime)) {
            date = DateTime.fromJSDate(date);
        }
        if (DateUtils.withinRange(date, prettyDateRelativeRange, "days")) {
            return date.toRelative();
        } else {
            return date.toFormat("MMM d, yyyy");
        }
    }

    public static ensureDuration(value: Duration | DurationObject | string): Duration {
        if (value instanceof Duration) {
            return value;
        } else if (typeof value === "string") {
            return Duration.fromISO(value);
        } else {
            return Duration.fromObject(value);
        }
    }

    /**
     * Return a pretty duration
     * 3d 2h 4m 1s
     */
    public static prettyDuration(duration: Duration | null, showMilli = false): string {
        if (!duration) { return "-"; }
        duration = this.ensureDuration(duration);
        let format: string | null = null;
        if (duration.as("days") > 1) {
            format = "d'd' h'h' mm'm' ss's'";
        } else if (duration.as("hours") > 1) {
            format = "h'h' mm'm' ss's'";
        } else if (duration.as("minutes") > 1) {
            format = "m'm' ss's'";
        } else {
            format = "s's'";
        }

        if (showMilli) {
            format += " SSS'ms'";
        }
        return duration.toFormat(format);
    }

    /**
     * Return a compact duration
     * 3:02:04:1.902
     */
    public static compactDuration(duration: Duration, showMilli = false): string {
        if (!duration) { return "-"; }
        duration = this.ensureDuration(duration);
        let format: string | null = null;
        if (duration.as("days") > 1) {
            format = "d:hh:mm:ss";
        } else if (duration.as("hours") > 1) {
            format = "hh:mm:ss";
        } else if (duration.as("minutes") > 1) {
            format = "mm:ss";
        } else {
            format = "ss";
        }

        if (showMilli) {
            format += ".SSS";
        }
        return duration.toFormat(format);
    }

    /**
     * Returns a full date and time
     * @example Feb 14th, 2017, 14:03:01
     */
    public static fullDateAndTime(date: Date | DateTime): string {
        if (!date) { return ""; }
        return date.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    }

    /**
     * Using the supplied start and end times, compute the duration.
     * @example 9m 2s, or null if no start time supplied.
     *
     * @param startTime - optional start time
     * @param endTime - optional end time
     */
    public static computeRuntime(startTime?: Date, endTime?: Date): string | null {
        if (!startTime) {
            return null;
        }
        const currentEndTime = endTime ? DateTime.fromJSDate(endTime) : DateTime.utc();
        const runtime = currentEndTime.diff(DateTime.fromJSDate(startTime));
        return DateUtils.prettyDuration(runtime);
    }

    /**
     * Display a moment in relation to a time other than now
     * @param timeToCompare - time to compare
     */
    public static timeFromNow(timeToCompare: Date): string | null {
        if (!timeToCompare) {
            return null;
        }
        return DateTime.fromJSDate(timeToCompare).toRelative();
    }
}
