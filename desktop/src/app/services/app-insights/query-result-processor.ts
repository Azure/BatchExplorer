import { AppInsightsMetricBody, AppInsightsMetricSegment, AppInsightsMetricTimeSegment } from "app/models/app-insights";
import { MetricDefinition } from "./metric-definition";

export class AppInsightQueryResultProcessor {
    private _groupBy: string[] = [];

    constructor(private metric: MetricDefinition) {
        if (metric.segment) {
            this._groupBy = metric.segment.split(",");
        }
    }

    public process<T>(data: AppInsightsMetricBody): T {
        const hasGroups = this._groupBy.length > 0;
        const result = hasGroups ? {} : [];
        for (const timeSegment of data.segments) {
            const time = this._getTime(timeSegment);
            if (hasGroups) {
                this._parseGroup(time, this._groupBy, timeSegment.segments, result);
            } else {
                const value = timeSegment[this.metric.appInsightsMetricId].avg;
                (result as any[]).push({
                    value,
                    time,
                });
            }
        }
        return result as any;
    }

    private _parseGroup(time: Date, groupBys: string[], segments: AppInsightsMetricSegment[], result: StringMap<any>) {
        const moreToGroup = groupBys.length > 1;
        for (const segment of segments) {
            const groupBy = groupBys.first();
            const group = segment[groupBy];
            if (!(group in result)) {
                result[group] = moreToGroup ? {} : [];
            }
            if (moreToGroup) {
                this._parseGroup(time, groupBys.slice(1), segment.segments, result[group]);
            } else {
                const value = segment[this.metric.appInsightsMetricId].avg;
                result[group].push({
                    value,
                    time,
                });
            }
        }
    }

    private _getTime(timeSegment: AppInsightsMetricTimeSegment) {
        return this._getDateAvg(new Date(timeSegment.start), new Date(timeSegment.end));
    }
    private _getDateAvg(start: Date, end: Date): Date {
        return new Date((end.getTime() + start.getTime()) / 2);
    }
}
