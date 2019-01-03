import {
    MonitorChartAggregation, MonitorChartMetrics, MonitorChartTimeFrame, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class FailedTaskMetrics extends MonitoringMetricDefinition {
    constructor(timespan: MonitorChartTimeFrame) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.TaskFailEvent, aggregation: MonitorChartAggregation.Total },
            ],
        });
    }
}
