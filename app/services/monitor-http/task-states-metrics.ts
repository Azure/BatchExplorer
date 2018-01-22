import { Subscription } from "rxjs";

import { Theme, ThemeService } from "app/services";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class TaskStatesMetrics extends MonitorMetricsBase {
    private _sub: Subscription;

    constructor(themeService: ThemeService) {
        super([
            MonitorChartMetrics.TaskStartEvent,
            MonitorChartMetrics.TaskCompleteEvent,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ]);

        this._sub = themeService.currentTheme.subscribe((theme: Theme) => {
            const statesColor = [
                { state: MonitorChartMetrics.TaskStartEvent, color: theme.monitorChart.taskStartEvent },
                { state: MonitorChartMetrics.TaskCompleteEvent, color: theme.monitorChart.taskCompleteEvent },
            ];
            super.setColor(statesColor);
        });
    }

    public dispose(): void {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
