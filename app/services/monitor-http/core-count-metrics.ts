import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "corecount", color: "#1C3F95" },
];

export class CoreCountMetrics extends MonitorMetricsBase {
    constructor() {
        super([ Metrics.CoreCount ], [ Aggregation.Total], statesColor);
    }
}
