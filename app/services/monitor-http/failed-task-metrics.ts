import { Subscription } from "rxjs";

import { Theme, ThemeService } from "app/services";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class FailedTaskMetrics extends MonitorMetricsBase {
    private _sub: Subscription;

    constructor(themeService: ThemeService) {
        super([ MonitorChartMetrics.TaskFailEvent ], [ MonitorChartAggregation.Total ]);

        this._sub = themeService.currentTheme.subscribe((theme: Theme) => {
            const statesColor = [
                { state: MonitorChartMetrics.TaskFailEvent, color: theme.monitorChart.taskFailEvent },
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
