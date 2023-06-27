import { DateTime, Duration } from "luxon";
import { TimeRange } from "./time-range.model";

const date1 = new Date(2019, 1, 2);
const date2 = new Date(2019, 1, 4);

const now = new Date(2019, 1, 7, 20, 9);
const nowDate = DateTime.fromJSDate(now);

describe("TimeRange Model", () => {

    beforeEach(() => {
        jasmine.clock().mockDate(now);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it("create a time range with a date", () => {
        const range = new TimeRange({ start: date1, end: date2 });
        expect(range.start).toEqual(date1);
        expect(range.end).toEqual(date2);
    });

    it("create a time range with end null", () => {
        const range = new TimeRange({ start: date1 });
        expect(range.start).toEqual(date1);
        expect(range.end).toEqual(now);
    });

    it("create a time range with start null", () => {
        const range = new TimeRange({ end: date2 });
        expect(range.start).toEqual(now);
        expect(range.end).toEqual(date2);
    });

    it("create a time range with start as a duration", () => {
        // Range 1h ago -> now
        const range = new TimeRange({ start: Duration.fromObject({ hours: -1 }) });
        expect(range.start.getTime()).toEqual(nowDate.minus({ hours: 1 }).toMillis());
        expect(range.end).toEqual(now);
    });

    it("create a time range with start and end as a duration", () => {
        // Range 24h ago -> in 12h
        const range = new TimeRange({
            start: Duration.fromObject({ days: -1 }),
            end: Duration.fromObject({ hours: 12 }),
        });
        expect(range.start.getTime()).toEqual(nowDate.minus({ hours: 24 }).toMillis());
        expect(range.end.getTime()).toEqual(nowDate.plus({ hours: 12 }).toMillis());
    });

    it("gets the duration between start and end for dates", () => {
        const range = new TimeRange({ start: date1, end: date2 });
        expect(range.duration.as("milliseconds")).toEqual(Duration.fromObject({ days: 2 }).as("milliseconds"));
    });

    it("computes the duration when start is a duration", () => {
        // Range 24h ago -> in 12h
        const range = new TimeRange({
            start: Duration.fromObject({ hours: -1 }),
        });
        expect(range.duration.as("milliseconds")).toEqual(Duration.fromObject({ hours: 1 }).as("milliseconds"));
    });

    it("computes the duration when start and end are duration too", () => {
        // Range 24h ago -> in 12h
        const range = new TimeRange({
            start: Duration.fromObject({ days: -1 }),
            end: Duration.fromObject({ hours: 12 }),
        });
        expect(range.duration.as("milliseconds")).toEqual(Duration.fromObject({ hours: 36 }).as("milliseconds"));
    });
});
