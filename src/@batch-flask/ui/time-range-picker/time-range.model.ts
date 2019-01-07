import { DateTime, Duration } from "luxon";

export interface TimeRangeAttributes {
    start?: Date | Duration | null;
    end?: Date | Duration | null;
}

export class TimeRange {
    private _start: Date | Duration | undefined | null;
    private _end: Date | Duration | undefined | null;

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

    private _computeDate(value: Date | Duration | undefined | null) {
        if (!value) {
            return new Date();
        } else if (value instanceof Duration) {
            return DateTime.local().plus(value).toJSDate();
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

// tslint:disable-next-line:variable-name
export const QuickRanges = {
    lastHour: new QuickRange({ label: "Last hour", start: Duration.fromObject({ hours: -1 }) }),
    last24h: new QuickRange({ label: "Last 24h", start: Duration.fromObject({ hours: -24 }) }),
    lastWeek: new QuickRange({ label: "Last week", start: Duration.fromObject({ weeks: -1 }) }),
    lastMonth: new QuickRange({ label: "Last month", start: Duration.fromObject({ months: -1 }) }),
    last90Days: new QuickRange({ label: "Last 90 days", start: Duration.fromObject({ days: -90 }) }),
};
