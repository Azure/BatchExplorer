import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class FailedTaskMetrics extends MonitorMetricsBase {
    constructor() {
        super([ Metrics.TaskFailEvent ], [ Aggregation.Total]);
    }
}
