import { TimeRange } from "@batch-flask/ui";
import {
    MonitorChartAggregation, MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Core minutes",
            timespan,
            metrics: [
                {
                    name: MonitorChartMetrics.CoreCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Dedicated",
                },
                {
                    name: MonitorChartMetrics.LowPriorityCoreCount,
                    aggregation: MonitorChartAggregation.Total,
                    label: "Low priority",
                },
            ],
        });
    }
}
