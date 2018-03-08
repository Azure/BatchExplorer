import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { InsightsMetricsService, Metric, MetricResponse, MonitorChartTimeFrame, MonitorChartType } from "app/services";

import "./monitor-chart.scss";

@Component({
    selector: "bl-monitor-chart",
    templateUrl: "monitor-chart.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorChartComponent implements OnChanges, OnDestroy {
    @Input() public chartType: MonitorChartType;
    public title = "";
    public type = "line";
    public datasets: Chart.ChartDataSets[];
    public lastValue: any[] = [];
    public options: Chart.ChartOptions = {};
    public timeFrame: MonitorChartTimeFrame = MonitorChartTimeFrame.Hour;
    public colors: any[];
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    private _sub: Subscription;
    private _observable: Observable<MetricResponse>;
    constructor(
        private changeDetector: ChangeDetectorRef,
        private monitor: InsightsMetricsService,
        private contextMenuService: ContextMenuService) {
        this._setChartOptions();
    }

    public ngOnChanges(changes): void {
        if (changes.chartType) {
            this.fetchObservable();
        }
    }

    public ngOnDestroy(): void {
        this._destroySub();
    }

    public fetchObservable() {
        this._observable = this._getChartObservable();
        if (!this._observable) {
            return;
        }
        this._destroySub();
        this._sub = this._observable.subscribe(response => {
            this._updateLoadingStatus(LoadingStatus.Loading);
            this.colors = [];
            this.timeFrame = response.timeFrame;
            this.lastValue = [];
            this.datasets = response.metrics.map((metric: Metric): Chart.ChartDataSets => {
                this.colors.push({
                    borderColor: metric.color,
                    backgroundColor: metric.color,
                });
                this.lastValue.push(metric.data.last().total || 0);
                return {
                    label: metric.name.localizedValue,
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
            this._updateLoadingStatus(LoadingStatus.Error);
        });
    }

    public openTimeFramePicker() {
        const items = [
            new ContextMenuItem({
                label: "Past hour", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Hour;
                    this.monitor.updateTimeFrame(this.timeFrame, this.chartType);
                    this.fetchObservable();
                },
            }),
            new ContextMenuItem({
                label: "Past day", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Day;
                    this.monitor.updateTimeFrame(this.timeFrame, this.chartType);
                    this.fetchObservable();
                },
            }),
            new ContextMenuItem({
                label: "Past week", click: () => {
                    this.timeFrame = MonitorChartTimeFrame.Week;
                    this.monitor.updateTimeFrame(this.timeFrame, this.chartType);
                    this.fetchObservable();
                },
            }),
        ];
        this.contextMenuService.openMenu(new ContextMenu(items));
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

    private _getChartObservable(): Observable<MetricResponse> {
        let observable: Observable<MetricResponse>;
        switch (this.chartType) {
            case MonitorChartType.CoreCount:
                this.title = "Core count";
                observable = this.monitor.getCoreCount();
                break;
            case MonitorChartType.FailedTask:
                this.title = "Failed task";
                observable = this.monitor.getFailedTask();
                break;
            case MonitorChartType.NodeStates:
                this.title = "Node states";
                observable = this.monitor.getNodeStates();
                break;
            case MonitorChartType.TaskStates:
                this.title = "Task states";
                observable = this.monitor.getTaskStates();
                break;
        }
        return observable;
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
                mode: "nearest",
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    display: true,
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
                    type: "time",
                    position: "bottom",
                    display: false,
                    // ticks: {
                    //     display: false,
                    // },
                    // scaleLabel: {
                    //     display: false,
                    // }
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
}
