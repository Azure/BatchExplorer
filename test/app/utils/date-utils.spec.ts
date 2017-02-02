import { DateUtils } from "app/utils";
import * as moment from "moment";

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
});
