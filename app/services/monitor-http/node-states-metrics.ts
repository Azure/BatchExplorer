import { MonitorChartTimeFrame } from "app/services";
import { MonitorChartAggregation, MonitorChartMetrics, MonitoringMetricDefinition } from "./monitor-metrics-base";

export class NodeStatesMetrics extends MonitoringMetricDefinition {
    constructor(timespan: MonitorChartTimeFrame) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.StartingNodeCount, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.IdleNodeCount, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.RunningNodeCount, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.StartTaskFailedNodeCount, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.RebootingNodeCount, aggregation: MonitorChartAggregation.Total },
            ],
        });
    }
}
