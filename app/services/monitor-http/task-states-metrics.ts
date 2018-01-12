import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class TaskStatesMetrics extends MonitorMetricsBase {
    constructor() {
        super([
            Metrics.TaskStartEvent,
            Metrics.TaskCompleteEvent,
        ], [
            Aggregation.Total,
            Aggregation.Total,
        ]);
    }
}
