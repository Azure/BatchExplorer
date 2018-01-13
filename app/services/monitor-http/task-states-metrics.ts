import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "taskstartevent", color: "#fffe5c" },
    { state: "taskcompleteevent", color: "#388e3c" },
];

export class TaskStatesMetrics extends MonitorMetricsBase {
    constructor() {
        super([
            Metrics.TaskStartEvent,
            Metrics.TaskCompleteEvent,
        ], [
            Aggregation.Total,
            Aggregation.Total,
        ], statesColor);
    }
}
