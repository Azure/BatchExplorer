import { TimeRange } from "@batch-flask/ui";
import {
    MonitorChartAggregation, MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class NodeStatesMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                {
                    name: MonitorChartMetrics.StartingNodeCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Starting",
                },
                {
                    name: MonitorChartMetrics.IdleNodeCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Idle",
                },
                {
                    name: MonitorChartMetrics.RunningNodeCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Running",
                },
                {
                    name: MonitorChartMetrics.StartTaskFailedNodeCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Start task failed",
                },
                {
                    name: MonitorChartMetrics.RebootingNodeCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Rebooting",
                },
            ],
        });
    }
}
