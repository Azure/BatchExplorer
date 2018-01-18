import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "corecount", color: "#1C3F95" },
    { state: "lowprioritycorecount", color: "#551A8B" },
];

export class CoreCountMetrics extends MonitorMetricsBase {
    constructor() {
        super([
            MonitorChartMetrics.CoreCount,
            MonitorChartMetrics.LowPriorityCoreCount,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ], statesColor);
    }
}
