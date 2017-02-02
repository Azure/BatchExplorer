import * as moment from "moment";

const prettyDateRelativeRange = 20;

export class DateUtils {
    /**
     * Check if the given date is withing the range of the last amount of unit given
     * @param date Date to Check
     * @param amount Amount of given unit
     * @param unit Moment.js Unit for the amount(days, year,etc)
     *
     * @example withinRange(date, 3, "days") // Check if date is less than 3 days old
     */
    public static withinRange(date: Date | moment.Moment, amount: number, unit: moment.unitOfTime.Diff) {
        return moment().diff(moment(date), unit) < amount;
    }

    /**
     * Return a short presentable date.
     * This will return a relative time if less that 20 days older
     * Otherwhise will print only the date in a readable way
     *
     * @example
     * - 2 hours ago
     * - Feb 2, 2016
     * - Nob 12, 2015
     */
    public static prettyDate(date: Date | moment.Moment) {
        if (!date) {
            return "";
        }
        const momentDate = moment(date);
        if (DateUtils.withinRange(momentDate, prettyDateRelativeRange, "days")) {
            return momentDate.fromNow();
        } else {
            return momentDate.format("MMM D, YYYY");
        }
    }
}
