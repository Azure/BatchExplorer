import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "taskfailevent", color: "#aa3939" },
];

export class FailedTaskMetrics extends MonitorMetricsBase {
    constructor() {
        super([ Metrics.TaskFailEvent ], [ Aggregation.Total], statesColor);
    }
}
