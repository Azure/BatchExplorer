import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "taskstartevent", color: "#fffe5c" },
    { state: "taskcompleteevent", color: "#388e3c" },
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
