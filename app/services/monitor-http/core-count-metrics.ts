import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitorMetricsBase {
    constructor() {
        super([ Metrics.CoreCount ], [ Aggregation.Total]);
    }
}
