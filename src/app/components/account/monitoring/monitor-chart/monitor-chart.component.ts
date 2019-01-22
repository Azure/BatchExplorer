import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
} from "@angular/core";
import { ServerError, isNotNullOrUndefined } from "@batch-flask/core";
import { ChartType, TimeRange } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { log } from "@batch-flask/utils";
import { Metric, MonitoringMetricList } from "app/models/monitoring";
import {
    BatchAccountService,
    InsightsMetricsService,
    MonitorChartAggregation,
    MonitorChartMetrics,
    MonitorChartType,
    ThemeService,
} from "app/services";
import { DateTime, Duration } from "luxon";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import { catchError, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";

import "./monitor-chart.scss";

const aggregationAttributes = {
    [MonitorChartAggregation.Avg]: "average",
    [MonitorChartAggregation.Sum]: "total",
};
@Component({
    selector: "bl-monitor-chart",
    templateUrl: "monitor-chart.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorChartComponent implements OnChanges, OnDestroy {
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
    public aggregation: MonitorChartAggregation;

    public get isChartReady() {
        return this.loadingStatus === LoadingStatus.Ready && this.datasets;
    }

    private _destroy = new Subject();
    private _metrics = new BehaviorSubject<MonitorChartType | null>(null);
    private _timeRange = new BehaviorSubject<TimeRange | null>(null);

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

        const metrics = combineLatest(
            this._metrics.pipe(filter(isNotNullOrUndefined)),
            this._timeRange.pipe(filter(isNotNullOrUndefined)),
            this.accountService.currentAccountId,
        ).pipe(
            takeUntil(this._destroy),
            tap(() => {
                this.chartError = null;
                this._updateLoadingStatus(LoadingStatus.Loading);
            }),
            switchMap(([metrics, timeRange]) => {
                return this._loadMetrics(metrics, timeRange).pipe(
                    catchError((error) => {
                        this.chartError = error;
                        if (error.code !== "LocalBatchAccount") {
                            log.error(`Error loading metrics for account metrics type: ${this.metrics}`, error);
                        }
                        this._updateLoadingStatus(LoadingStatus.Error);
                        return of(null);
                    }),
                );
            }),
            filter(isNotNullOrUndefined),
            tap((response) => {
                this.interval = response.interval;
                this._updateLoadingStatus(LoadingStatus.Ready);
            }),
            map(x => x.metrics),
        );

        const aggregation = this._metrics.pipe(
            filter(isNotNullOrUndefined),
            takeUntil(this._destroy),
        ).pipe(
            map((metric) => this._getAggregateType(metric)),
        );

        combineLatest(metrics, aggregation, chartTheme).pipe(
            takeUntil(this._destroy),
        ).subscribe(([metrics, aggregation, theme]) => {
            this._buildDataSets(metrics, aggregation, theme);
        });

    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.metrics) {
            this._metrics.next(this.metrics);
        }
        if (changes.timeRange) {
            this._timeRange.next(this.timeRange);
        }
        if (changes.preview) {
            this._setChartOptions();
        }
    }

    public ngOnDestroy(): void {
        this._metrics.complete();
        this._timeRange.complete();
        this._destroy.next();
        this._destroy.complete();
    }

    public trackDataSet(_: number, dataset: Chart.ChartDataSets) {
        return dataset.label;
    }

    private _loadMetrics(metrics: MonitorChartType, timeRange: TimeRange): Observable<MonitoringMetricList> {
        switch (metrics) {
            case MonitorChartType.CoreCount:
                return this.monitor.getCoreMinutes(timeRange);
            case MonitorChartType.FailedTask:
                return this.monitor.getFailedTask(timeRange);
            case MonitorChartType.NodeStates:
                return this.monitor.getNodeStates(timeRange);
            case MonitorChartType.TaskStates:
                return this.monitor.getTaskStates(timeRange);
        }
    }

    private _getAggregateType(metrics: MonitorChartType): MonitorChartAggregation {
        switch (metrics) {
            case MonitorChartType.CoreCount:
                return MonitorChartAggregation.Avg;
            case MonitorChartType.FailedTask:
                return MonitorChartAggregation.Sum;
            case MonitorChartType.NodeStates:
                return MonitorChartAggregation.Avg;
            case MonitorChartType.TaskStates:
                return MonitorChartAggregation.Sum;
            default:
                return MonitorChartAggregation.Avg;

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

    private _computeTooltipTitle(item: Chart.ChartTooltipItem, data) {
        const interval = this.interval;
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

    private _buildDataSets(metrics: Metric[], aggregation: MonitorChartAggregation, theme: StringMap<string>) {
        this.colors = [];
        this.total = [];
        this.aggregation = aggregation;

        if (!metrics) {
            this.datasets = [];
            return;
        }

        this.colors = this._computeColors(metrics, theme);
        const aggregationAttribute = aggregationAttributes[aggregation] || "average";
        this.datasets = metrics.map((metric: Metric): Chart.ChartDataSets => {
            const total = metric.data.map(x => x[aggregationAttribute] || 0).reduce((a, b) => {
                return a + b;
            }, 0);

            const summary = aggregation === MonitorChartAggregation.Avg
                ? (total / metric.data.length).toFixed(1)
                : total;
            this.total.push(summary);

            return {
                label: metric.label,
                data: metric.data.map(data => {
                    return {
                        x: data.timeStamp,
                        y: data[aggregationAttribute] || 0,
                    } as Chart.ChartPoint;
                }),
                borderWidth: 1,
                fill: false,
            } as Chart.ChartDataSets;
        });
        this.changeDetector.markForCheck();
    }
}
