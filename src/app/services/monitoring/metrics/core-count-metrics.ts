import { TimeRange } from "@batch-flask/ui";
import {
     MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Core minutes",
            timespan,
            metrics: [
                {
                    name: MonitorChartMetrics.CoreCount,
                    label: "Dedicated",
                },
                {
                    name: MonitorChartMetrics.LowPriorityCoreCount,
                    label: "Spot/low-priority",
                },
            ],
        });
    }
}
