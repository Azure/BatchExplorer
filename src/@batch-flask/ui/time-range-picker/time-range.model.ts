import { DateTime, Duration } from "luxon";

export interface TimeRangeAttributes {
    start?: Date | Duration | (() => Date) | null;
    end?: Date | Duration | (() => Date) | null;
}

export class TimeRange {
    private _start: Date | Duration | (() => Date) | undefined | null;
    private _end: Date | Duration | (() => Date) | undefined | null;

    constructor(range: TimeRangeAttributes) {
        this._start = range.start;
        this._end = range.end;
    }

    public get start(): Date {
        return this._computeDate(this._start);
    }

    public get end(): Date {
        return this._computeDate(this._end);
    }

    public get duration() {
        return DateTime.fromJSDate(this.end).diff(DateTime.fromJSDate(this.start));
    }

    private _computeDate(value: Date | Duration | (() => Date) | undefined | null): Date {
        if (!value) {
            return new Date();
        } else if (value instanceof Duration) {
            return DateTime.local().plus(value).toJSDate();
        } else if (value instanceof Function) {
            return value();
        } else {
            return value;
        }
    }
}

export class QuickRange extends TimeRange {
    public label: string;

    constructor(data: { label: string } & TimeRangeAttributes) {
        super(data);
        this.label = data.label;
    }
}

const today = DateTime.local();

// tslint:disable-next-line:variable-name
export const QuickRanges = {
    lastHour: new QuickRange({ label: "Last hour", start: Duration.fromObject({ hours: -1 }) }),
    last24h: new QuickRange({ label: "Last 24h", start: Duration.fromObject({ hours: -24 }) }),
    lastWeek: new QuickRange({ label: "Last week", start: Duration.fromObject({ weeks: -1 }) }),
    lastMonth: new QuickRange({ label: "Last month", start: Duration.fromObject({ months: -1 }) }),
    last90Days: new QuickRange({ label: "Last 90 days", start: Duration.fromObject({ days: -90 }) }),

    thisMonthRange: new QuickRange({
        label: "This month",
        start: today.startOf("month").toJSDate(),
        end: today.endOf("month").toJSDate(),
    }),

    lastMonthRange: new QuickRange({
        label: "Last month",
        start: today.minus({ month: 1 }).startOf("month").toJSDate(),
        end: today.minus({ month: 1 }).endOf("month").toJSDate(),
    }),

    thisQuarterRange: new QuickRange({
        label: "This quarter",
        start: today.startOf("quarter").toJSDate(),
        end: today.endOf("quarter").toJSDate(),
    }),

    thisYearRange: new QuickRange({
        label: "This year",
        start: today.startOf("year").toJSDate(),
        end: today.endOf("year").toJSDate(),
    }),
};
