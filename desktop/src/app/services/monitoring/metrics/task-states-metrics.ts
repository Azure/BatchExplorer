import { TimeRange } from "@batch-flask/ui/time-range-picker";
import {
    MonitorChartMetrics, MonitoringMetricDefinition,
} from "./monitor-metrics-base";

export class TaskStatesMetrics extends MonitoringMetricDefinition {
    constructor(timespan: TimeRange) {
        super({
            name: "Task failed events",
            timespan,
            metrics: [
                { name: MonitorChartMetrics.TaskStartEvent },
                { name: MonitorChartMetrics.TaskCompleteEvent },
            ],
        });
    }
}
