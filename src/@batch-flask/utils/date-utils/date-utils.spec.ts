import { DateTime, Duration } from "luxon";
import { DateUtils } from "./date-utils";

describe("DateUtils", () => {
    describe("#withinRange()", () => {
        it("return false when older", () => {
            expect(DateUtils.withinRange(DateTime.local().minus({ days: 2 }), 1, "days")).toBe(false);
            expect(DateUtils.withinRange(DateTime.local().minus({ years: 1 }), 1, "days")).toBe(false);
            expect(DateUtils.withinRange(DateTime.local().minus({ seconds: 65 }), 1, "minute")).toBe(false);
        });

        it("return true when NOT older", () => {
            expect(DateUtils.withinRange(new Date(), 1, "days")).toBe(true);
            expect(DateUtils.withinRange(DateTime.local().minus({ days: 1 }), 2, "days")).toBe(true);
            expect(DateUtils.withinRange(DateTime.local().minus({ seconds: 48 }), 1, "minute")).toBe(true);
        });
    });

    describe("#prettyDate()", () => {
        it("return a relative time when less than 20 days", () => {
            expect(DateUtils.prettyDate(DateTime.local().minus({ days: 2 }))).toEqual("2 days ago");
            expect(DateUtils.prettyDate(DateTime.local().minus({ minutes: 3 }))).toEqual("3 minutes ago");
            expect(DateUtils.prettyDate(DateTime.local().minus({ seconds: 55 }))).toEqual("55 seconds ago");
            expect(DateUtils.prettyDate(DateTime.local().minus({ seconds: 83 }))).toEqual("1 minute ago");
            expect(DateUtils.prettyDate(DateTime.local().minus({ days: 19 }))).toEqual("19 days ago");
        });

        it("return a absolute time when more than 20 days", () => {
            const date1 = DateTime.local().minus({ days: 20 });
            const date2 = DateTime.local().minus({ years: 1 });
            expect(DateUtils.prettyDate(date1)).toEqual(date1.toFormat("MMM d, yyyy"));
            expect(DateUtils.prettyDate(date2)).toEqual(date2.toFormat("MMM d, yyyy"));
        });
    });

    describe("#prettyDuration()", () => {
        it("show the duration in pretty format", () => {
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3 }))).toEqual("2h 03m 00s");
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 })))
                .toEqual("2h 03m 57s");
            expect(DateUtils.prettyDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }))).toEqual("2h 03m 57s");
        });
        it("show the duration in pretty format with milliseconds if ask", () => {
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3 }), true))
                .toEqual("2h 03m 00s 000ms");
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 }), true))
                .toEqual("2h 03m 57s 000ms");
            expect(DateUtils.prettyDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }), true))
                .toEqual("2h 03m 57s 876ms");
        });
    });

    describe("#compactDuration()", () => {
        it("show the duration in pretty format", () => {
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3 }))).toEqual("02:03:00");
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 })))
                .toEqual("02:03:57");
            expect(DateUtils.compactDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }))).toEqual("02:03:57");
        });
        it("show the duration in pretty format with milliseconds if ask", () => {
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3 }), true))
                .toEqual("02:03:00.000");
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 }), true))
                .toEqual("02:03:57.000");
            expect(DateUtils.compactDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }), true))
                .toEqual("02:03:57.876");
        });
    });

    describe("#fullDateAndTime()", () => {
        it("returns empty string when no date supplied", () => {
            expect(DateUtils.fullDateAndTime(null)).toEqual("");
        });

        it("returns formatted full date", () => {
            // note: date month array starts at 0 for jan
            const date = new Date(2017, 11, 24, 10, 55, 2);
            expect(DateUtils.fullDateAndTime(date)).toEqual(
                DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS));
        });
    });

    describe("#computeRuntime()", () => {
        it("compute the duration between start and end time", () => {
            const date1 = new Date(2017, 12, 21, 8, 2, 54);
            const date2 = new Date(2017, 12, 21, 9, 38, 38);
            expect(DateUtils.computeRuntime(date1, date2)).toEqual("1h 35m 44s");
        });

        it("compute the duration between start and current time", () => {
            const date = DateTime.local().minus({ hours: 2, minutes: 43 }).toJSDate();
            expect(DateUtils.computeRuntime(date)).toEqual("2h 43m 00s");
        });
    });
});
