import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class NodeStatesMetrics extends MonitorMetricsBase {
    constructor() {
        super([
            Metrics.StartingNodeCount,
            Metrics.IdleNodeCount,
            Metrics.RunningNodeCount,
            Metrics.StartTaskFailedNodeCount,
            Metrics.RebootingNodeCount,
        ], [
            Aggregation.Total,
            Aggregation.Total,
            Aggregation.Total,
            Aggregation.Total,
            Aggregation.Total,
        ]);
    }
}
