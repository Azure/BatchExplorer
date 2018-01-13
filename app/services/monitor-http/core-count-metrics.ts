import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: "corecount", color: "#1C3F95" },
];

export class CoreCountMetrics extends MonitorMetricsBase {
    constructor() {
        super([ MonitorChartMetrics.CoreCount ], [ MonitorChartAggregation.Total], statesColor);
    }
}
