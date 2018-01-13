import { NodeState } from "app/models";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

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
            MonitorChartMetrics.StartingNodeCount,
            MonitorChartMetrics.IdleNodeCount,
            MonitorChartMetrics.RunningNodeCount,
            MonitorChartMetrics.StartTaskFailedNodeCount,
            MonitorChartMetrics.RebootingNodeCount,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ], statesColor);
    }
}
