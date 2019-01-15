import { TimeRange } from "@batch-flask/ui";
import {
    MonitorChartAggregation, MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class FailedTaskMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.TaskFailEvent, aggregation: MonitorChartAggregation.Total },
            ],
        });
    }
}
