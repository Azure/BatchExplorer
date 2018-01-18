import { OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Theme, ThemeService } from "app/services";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class CoreCountMetrics extends MonitorMetricsBase implements OnDestroy {
    private _sub: Subscription;

    constructor(themeService: ThemeService) {
        super([
            MonitorChartMetrics.CoreCount,
            MonitorChartMetrics.LowPriorityCoreCount,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ]);

        this._sub = themeService.currentTheme.subscribe((theme: Theme) => {
            const statesColor = [
                { state: MonitorChartMetrics.CoreCount, color: theme.monitorChart.coreCount },
                { state: MonitorChartMetrics.LowPriorityCoreCount, color: theme.monitorChart.lowPriorityCoreCount },
            ];
            super.setColor(statesColor);
        });
    }

    public ngOnDestroy(): void {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
