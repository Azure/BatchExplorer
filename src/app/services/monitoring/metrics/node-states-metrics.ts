import { TimeRange } from "@batch-flask/ui";
import {
    MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class NodeStatesMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                {
                    name: MonitorChartMetrics.StartingNodeCount,
                    label: "Starting",
                },
                {
                    name: MonitorChartMetrics.IdleNodeCount,
                    label: "Idle",
                },
                {
                    name: MonitorChartMetrics.RunningNodeCount,
                    label: "Running",
                },
                {
                    name: MonitorChartMetrics.StartTaskFailedNodeCount,
                    label: "Start task failed",
                },
                {
                    name: MonitorChartMetrics.RebootingNodeCount,
                    label: "Rebooting",
                },
            ],
        });
    }
}
