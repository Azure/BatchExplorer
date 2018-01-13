import { NodeState } from "app/models";
import { Aggregation, Metrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: NodeState.starting, color: "#fffe5c" },
    { state: NodeState.idle, color: "#edeef2" },
    { state: NodeState.running, color: "#388e3c" },
    { state: NodeState.startTaskFailed, color: "#aa3939" },
    { state: NodeState.rebooting, color: "#ffcc5c" },
];

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
        ], statesColor);
    }
}
