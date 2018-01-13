import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "taskfailevent", color: "#aa3939" },
];

export class FailedTaskMetrics extends MonitorMetricsBase {
    constructor() {
        super([ MonitorChartMetrics.TaskFailEvent ], [ MonitorChartAggregation.Total], statesColor);
    }
}
