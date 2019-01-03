import {
    MonitorChartAggregation, MonitorChartMetrics, MonitorChartTimeFrame, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class TaskStatesMetrics extends MonitoringMetricDefinition {
    constructor(timespan: MonitorChartTimeFrame) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.TaskStartEvent, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.TaskCompleteEvent, aggregation: MonitorChartAggregation.Total },
            ],
        });
    }
}
