import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { ChartType, TimeRange } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { log } from "@batch-flask/utils";
import { Metric, MonitoringMetricList } from "app/models/monitoring";
import {
    BatchAccountService, InsightsMetricsService,
    MonitorChartMetrics, MonitorChartType, ThemeService,
} from "app/services";
import { DateTime, Duration } from "luxon";
import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import "./monitor-chart.scss";

@Component({
    selector: "bl-monitor-chart",
    templateUrl: "monitor-chart.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorChartComponent implements OnChanges, OnDestroy {

    public get isChartReady() {
        return this.loadingStatus === LoadingStatus.Ready && this.datasets;
    }
    @Input() public chartType: ChartType = ChartType.Line;
    @Input() public metrics: MonitorChartType;
    @Input() public preview: boolean = false;
    @Input() public timeRange: TimeRange;

    public title = "";
    public datasets: Chart.ChartDataSets[];
    public total: any[] = [];
    public interval: Duration;
    public colors: any[];
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public options: Chart.ChartOptions = {};
    public chartError: ServerError | null = null;

    private _accountSub: Subscription;
    private _sub: Subscription;
    private _metricList: MonitoringMetricList;
    private _metrics = new BehaviorSubject<Metric[]>(null);

    constructor(
        themeService: ThemeService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private monitor: InsightsMetricsService) {
        this._setChartOptions();

        const chartTheme = themeService.currentTheme.pipe(
            map((theme) => {
                return {
                    [MonitorChartMetrics.CoreCount]: theme.monitorChart.coreCount,
                    [MonitorChartMetrics.IdleNodeCount]: theme.monitorChart.idleNodeCount,
                    [MonitorChartMetrics.LowPriorityCoreCount]: theme.monitorChart.lowPriorityCoreCount,
                    [MonitorChartMetrics.RebootingNodeCount]: theme.monitorChart.rebootingNodeCount,
                    [MonitorChartMetrics.RunningNodeCount]: theme.monitorChart.runningNodeCount,
                    [MonitorChartMetrics.StartingNodeCount]: theme.monitorChart.startingNodeCount,
                    [MonitorChartMetrics.StartTaskFailedNodeCount]: theme.monitorChart.startTaskFailedNodeCount,
                    [MonitorChartMetrics.TaskCompleteEvent]: theme.monitorChart.taskCompleteEvent,
                    [MonitorChartMetrics.TaskFailEvent]: theme.monitorChart.taskFailEvent,
                    [MonitorChartMetrics.TaskStartEvent]: theme.monitorChart.taskStartEvent,
                };
            }),
        );

        combineLatest(this._metrics, chartTheme).subscribe(([metrics, theme]) => {
            this.colors = [];
            this.total = [];

            if (!metrics) {
                this.datasets = [];
                return;
            }
            this.colors = this._computeColors(metrics, theme);
            this.datasets = metrics.map((metric: Metric): Chart.ChartDataSets => {

                const total = metric.data.map(x => x.average || 0).reduce((a, b) => {
                    return a + b;
                }, 0);
                this.total.push((total / metric.data.length).toFixed(1));

                return {
                    label: metric.label,
                    data: metric.data.map(data => {
                        return {
                            x: data.timeStamp,
                            y: data.average || 0,
                        } as Chart.ChartPoint;
                    }),
                    borderWidth: 1,
                    fill: false,
                } as Chart.ChartDataSets;
            });
            this.changeDetector.markForCheck();
        });

        this._accountSub = this.accountService.currentAccountId.subscribe(() => {
            this.refreshMetrics();
        });
    }

    public ngOnChanges(changes): void {
        if (changes.metrics) {
            this.refreshMetrics();
        }
        if (changes.timeRange) {
            this.refreshMetrics();
        }
        if (changes.preview) {
            this._setChartOptions();
        }
    }

    public ngOnDestroy(): void {
        this._destroySub();
        this._metrics.complete();
        this._accountSub.unsubscribe();
    }

    public refreshMetrics() {
        this.chartError = null;
        const obs = this._loadMetrics();
        if (!obs) { return; }

        this._destroySub();
        this._updateLoadingStatus(LoadingStatus.Loading);
        this._sub = obs.subscribe(response => {
            this._metricList = response;
            this.interval = response.interval;
            this._metrics.next(response.metrics);
            this._updateLoadingStatus(LoadingStatus.Ready);
        }, (error) => {
            this.chartError = error;
            log.error(`Error loading metrics for account metrics type: ${this.metrics}`, error);
            this._updateLoadingStatus(LoadingStatus.Error);
        });
    }

    public trackDataSet(index, dataset) {
        return dataset.label;
    }

    private _loadMetrics(): Observable<MonitoringMetricList> {
        switch (this.metrics) {
            case MonitorChartType.CoreCount:
                return this.monitor.getCoreMinutes(this.timeRange);
            case MonitorChartType.FailedTask:
                return this.monitor.getFailedTask(this.timeRange);
            case MonitorChartType.NodeStates:
                return this.monitor.getNodeStates(this.timeRange);
            case MonitorChartType.TaskStates:
                return this.monitor.getTaskStates(this.timeRange);
        }
    }

    private _setChartOptions() {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 3,
                },
                line: {
                    tension: 0.05,
                },
            },
            legend: {
                display: false,
            },
            tooltips: {
                enabled: true,
                mode: "index",
                callbacks: {
                    title: (tooltipItems, data) => {
                        return this._computeTooltipTitle(tooltipItems[0], data);
                    },
                },
            },
            scales: {
                yAxes: [{
                    stacked: true,
                    type: "linear",
                    display: !this.preview,
                    ticks: {
                        min: 0,
                        autoSkip: true,
                        callback: (value) => {
                            if (value % 1 === 0) {
                                return value;
                            }
                        },
                    },
                }],
                xAxes: [{
                    stacked: true,
                    type: "time",
                    position: "bottom",
                    display: false,
                }],
            },
        };
    }

    private _updateLoadingStatus(status: LoadingStatus) {
        this.loadingStatus = status;
        this.changeDetector.markForCheck();
    }

    private _destroySub() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }

    private _computeTooltipTitle(item: Chart.ChartTooltipItem, data) {
        const interval = this._metricList.interval;
        const start = DateTime.fromISO(item.xLabel);
        const end = start.plus(interval);
        return `Data between ${start.toFormat("hh:mm A")} and ${end.toFormat("hh:mm A")} on ${start.toFormat("LL")}`;
    }

    /**
     * Get the colors for the coresponding metrics
     */
    private _computeColors(metrics: Metric[], theme: StringMap<string>) {
        if (!theme || !metrics) {
            return [];
        } else {
            return metrics.map((metric) => {
                const color = theme[metric.name];

                return {
                    borderColor: color,
                    backgroundColor: color,
                };
            });
        }
    }
}
