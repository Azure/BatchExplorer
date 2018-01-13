import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "taskstartevent", color: "#1C3F95" },
    { state: "taskcompleteevent", color: "#ffa90d" },
];

export class TaskStatesMetrics extends MonitorMetricsBase {
    constructor() {
        super([
            MonitorChartMetrics.TaskStartEvent,
            MonitorChartMetrics.TaskCompleteEvent,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ], statesColor);
    }
}
