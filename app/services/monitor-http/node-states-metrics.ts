import { OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Theme, ThemeService } from "app/services";
import { MonitorChartAggregation, MonitorChartMetrics, MonitorMetricsBase } from "./monitor-metrics-base";

export class NodeStatesMetrics extends MonitorMetricsBase implements OnDestroy {
    private _sub: Subscription;

    constructor(themeService: ThemeService) {
        super([
            MonitorChartMetrics.StartingNodeCount,
            MonitorChartMetrics.IdleNodeCount,
            MonitorChartMetrics.RunningNodeCount,
            MonitorChartMetrics.StartTaskFailedNodeCount,
            MonitorChartMetrics.RebootingNodeCount,
        ], [
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
            MonitorChartAggregation.Total,
        ]);

        this._sub = themeService.currentTheme.subscribe((theme: Theme) => {
            const statesColor = [
                { state: MonitorChartMetrics.StartingNodeCount, color: theme.monitorChart.startingNodeCount },
                { state: MonitorChartMetrics.IdleNodeCount, color: theme.monitorChart.idleNodeCount },
                { state: MonitorChartMetrics.RunningNodeCount, color: theme.monitorChart.runningNodeCount },
                {
                    state: MonitorChartMetrics.StartTaskFailedNodeCount,
                    color: theme.monitorChart.startTaskFailedNodeCount,
                },
                { state: MonitorChartMetrics.RebootingNodeCount, color: theme.monitorChart.rebootingNodeCount },
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
