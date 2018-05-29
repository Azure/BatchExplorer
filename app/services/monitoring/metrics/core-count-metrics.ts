import {
    MonitorChartAggregation, MonitorChartMetrics, MonitorChartTimeFrame, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitoringMetricDefinition {
    constructor(timespan: MonitorChartTimeFrame) {
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
