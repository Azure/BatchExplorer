import { NodeState } from "app/models";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

const statesColor = [
    { state: NodeState.starting, color: "#1C3F95" },
    { state: NodeState.idle, color: "#be93d9" },
    { state: NodeState.running, color: "#388e3c" },
    { state: NodeState.startTaskFailed, color: "#aa3939" },
    { state: NodeState.rebooting, color: "#ff755c" },
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
