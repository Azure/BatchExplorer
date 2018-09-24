import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import {
    BatchAccountService, InsightsMetricsService,
    MonitorChartMetrics, MonitorChartTimeFrame, MonitorChartType, ThemeService,
} from "app/services";

import { log } from "@batch-flask/utils";
import { Metric, MonitoringMetricList } from "app/models/monitoring";
import "./monitor-chart.scss";

@Component({
    selector: "bl-monitor-chart",
    templateUrl: "monitor-chart.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorChartComponent implements OnChanges, OnDestroy {
    @Input() public chartType: MonitorChartType;
    @Input() public preview: boolean = false;

    public type: string = "bar";
    public title = "";
    public datasets: Chart.ChartDataSets[];
    public total: any[] = [];
    public interval: moment.Duration;
    public timeFrame: MonitorChartTimeFrame = MonitorChartTimeFrame.Hour;
    public colors: any[];
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;
    public options: Chart.ChartOptions = {};

    private _themeSub: Subscription;
    private _accountSub: Subscription;
    private _sub: Subscription;
    private _theme: StringMap<string>;
    private _metricList: MonitoringMetricList;

    constructor(
        themeService: ThemeService,
        private accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private monitor: InsightsMetricsService,
        private contextMenuService: ContextMenuService) {
        this._setChartOptions();

        this._themeSub = themeService.currentTheme.subscribe((theme) => {
            this._theme = {
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
        });
        this._accountSub = this.accountService.currentAccountId.subscribe(() => {
            this.refreshMetrics();
        });
    }

    public ngOnChanges(changes): void {
        if (changes.chartType) {
            this.refreshMetrics();
            this._updateTitle();
        }
        if (changes.preview) {
            this._setChartOptions();
        }
    }

    public ngOnDestroy(): void {
        this._destroySub();
        this._themeSub.unsubscribe();
        this._accountSub.unsubscribe();
    }

    public refreshMetrics() {
        const obs = this._loadMetrics();
        if (!obs) { return; }

        this._destroySub();
        this._updateLoadingStatus(LoadingStatus.Loading);
        this._sub = obs.subscribe(response => {
            this._metricList = response;
            this.colors = [];
            this.total = [];
            this.interval = response.interval;
            this.datasets = response.metrics.map((metric: Metric): Chart.ChartDataSets => {
                const color = this._theme[metric.name];
                this.colors.push({
                    borderColor: color,
                    backgroundColor: color,
                });
                const total = metric.data.map(x => x.total || 0).reduce((a, b) => {
                    return a + b;
                }, 0);
                this.total.push(total);
                return {
                    label: metric.label,
                    data: metric.data.map(data => {
                        return {
                            x: data.timeStamp,
                            y: data.total || 0,
                        } as Chart.ChartPoint;
                    }),
                    borderWidth: 1,
                    fill: false,
                } as Chart.ChartDataSets;
            });
            this._updateLoadingStatus(LoadingStatus.Ready);
        }, (error) => {
            log.error(`Error loading metrics for account metrics type: ${this.chartType}`, error);
            this._updateLoadingStatus(LoadingStatus.Error);
        });
    }

    public openTimeFramePicker(event: Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const items = [
            new ContextMenuItem({
                label: "Past hour", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Hour;
                    this.refreshMetrics();
                },
            }),
            new ContextMenuItem({
                label: "Past day", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Day;
                    this.refreshMetrics();
                },
            }),
            new ContextMenuItem({
                label: "Past week", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Week;
                    this.refreshMetrics();
                },
            }),
            new ContextMenuItem({
                label: "Past month", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Month;
                    this.refreshMetrics();
                },
            }),
        ];
        this.contextMenuService.openMenu(new ContextMenu(items));
        this.changeDetector.markForCheck();
    }

    public get isChartReady() {
        return this.loadingStatus === LoadingStatus.Ready && this.datasets;
    }

    public get chartError() {
        return this.loadingStatus === LoadingStatus.Error;
    }

    public trackDataSet(index, dataset) {
        return dataset.label;
    }

    private _loadMetrics(): Observable<MonitoringMetricList> {
        switch (this.chartType) {
            case MonitorChartType.CoreCount:
                return this.monitor.getCoreMinutes(this.timeFrame);
            case MonitorChartType.FailedTask:
                return this.monitor.getFailedTask(this.timeFrame);
            case MonitorChartType.NodeStates:
                return this.monitor.getNodeStates(this.timeFrame);
            case MonitorChartType.TaskStates:
                return this.monitor.getTaskStates(this.timeFrame);
        }
    }

    private _updateTitle() {
        switch (this.chartType) {
            case MonitorChartType.CoreCount:
                this.title = "Core minutes";
                break;
            case MonitorChartType.FailedTask:
                this.title = "Failed task";
                break;
            case MonitorChartType.NodeStates:
                this.title = "Node states";
                break;
            case MonitorChartType.TaskStates:
                this.title = "Task states";
                break;
        }
        this.changeDetector.markForCheck();
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
        const start = moment(item.xLabel);
        const end = moment(start).add(interval);
        return `Data between ${start.format("hh:mm A")} and ${end.format("hh:mm A")} on ${start.format("LL")}`;
    }
}
