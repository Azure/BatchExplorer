import * as moment from "moment";
import { DateUtils } from "./date-utils";
import { Duration } from "luxon";

describe("DateUtils", () => {
    describe("#withinRange()", () => {
        it("return false when older", () => {
            expect(DateUtils.withinRange(moment().subtract(2, "days"), 1, "days")).toBe(false);
            expect(DateUtils.withinRange(moment().subtract(1, "year"), 1, "days")).toBe(false);
            expect(DateUtils.withinRange(moment().subtract(65, "seconds"), 1, "minute")).toBe(false);
        });

        it("return true when NOT older", () => {
            expect(DateUtils.withinRange(moment(), 1, "days")).toBe(true);
            expect(DateUtils.withinRange(moment().subtract(1, "days"), 2, "days")).toBe(true);
            expect(DateUtils.withinRange(moment().subtract(48, "seconds"), 1, "minute")).toBe(true);
        });
    });

    describe("#prettyDate()", () => {
        it("return a relative time when less than 20 days", () => {
            expect(DateUtils.prettyDate(moment().subtract(2, "days"))).toEqual("2 days ago");
            expect(DateUtils.prettyDate(moment().subtract(3, "minutes"))).toEqual("3 minutes ago");
            expect(DateUtils.prettyDate(moment().subtract(55, "seconds"))).toEqual("a minute ago");
            expect(DateUtils.prettyDate(moment().subtract(83, "seconds"))).toEqual("a minute ago");
            expect(DateUtils.prettyDate(moment().subtract(19, "days"))).toEqual("19 days ago");
        });

        it("return a absoluate time when more than 20 days", () => {
            const date1 = moment().subtract(20, "days");
            const date2 = moment().subtract(1, "year");
            expect(DateUtils.prettyDate(date1)).toEqual(date1.format("MMM D, YYYY"));
            expect(DateUtils.prettyDate(date2)).toEqual(date2.format("MMM D, YYYY"));
        });
    });

    describe("#prettyDuration()", () => {
        it("show the duration in pretty format", () => {
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3 }))).toEqual("2h 03m 00s");
            expect(DateUtils.prettyDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 })))
                .toEqual("2h 03m 57s");
            expect(DateUtils.prettyDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }))).toEqual("2h 03m 58s");
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
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3 }))).toEqual("2:03:00");
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 })))
                .toEqual("2:03:57");
            expect(DateUtils.compactDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }))).toEqual("2:03:58");
        });
        it("show the duration in pretty format with milliseconds if ask", () => {
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3 }), true))
                .toEqual("2:03:00.000");
            expect(DateUtils.compactDuration(Duration.fromObject({ hours: 2, minutes: 3, seconds: 57 }), true))
                .toEqual("2:03:57.000");
            expect(DateUtils.compactDuration(
                Duration.fromObject({ hours: 2, minutes: 3, seconds: 57, milliseconds: 876 }), true))
                .toEqual("2:03:57.876");
        });
    });

    describe("#fullDateAndTime()", () => {
        it("returns empty string when no date supplied", () => {
            expect(DateUtils.fullDateAndTime(null)).toEqual("");
        });

        it("returns formatted full date", () => {
            // note: date month array starts at 0 for jan
            const date = new Date(2017, 11, 24, 10, 55, 2);
            expect(DateUtils.fullDateAndTime(date)).toEqual(moment(date).format("MMM Do, YYYY, HH:mm:ss.SSS Z"));
            // Timezone depends who runs the test so just check for the rest
            expect(DateUtils.fullDateAndTime(date)).toContain("Dec 24th, 2017, 10:55:02.000");
        });
    });

    describe("#computeRuntime()", () => {
        it("compute the duration between start and end time", () => {
            const date1 = new Date(2017, 12, 21, 8, 2, 54);
            const date2 = new Date(2017, 12, 21, 9, 38, 38);
            expect(DateUtils.computeRuntime(date1, date2)).toEqual("1h 35m 44s");
        });

        it("compute the duration between start and current time", () => {
            const date = moment().subtract({ hours: 2, minutes: 43 }).toDate();
            expect(DateUtils.computeRuntime(date)).toEqual("2h 43m 00s");
        });
    });
});
