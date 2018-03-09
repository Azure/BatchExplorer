import {
    MonitorChartAggregation, MonitorChartMetrics, MonitorChartTimeFrame, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitoringMetricDefinition {
    constructor(timespan: MonitorChartTimeFrame) {
        super({
            name: "Core minutes",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.CoreCount, aggregation: MonitorChartAggregation.Total },
                { name: MonitorChartMetrics.LowPriorityCoreCount, aggregation: MonitorChartAggregation.Total },
            ],
        });
    }
}
