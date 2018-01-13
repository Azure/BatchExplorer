import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";
import { Metric, MonitorChartTimeFrame, MonitorChartType, MonitorHttpService } from "app/services";

import "./monitor-chart.scss";

@Component({
    selector: "bl-monitor-chart",
    templateUrl: "monitor-chart.html",
})
export class MonitorChartComponent implements OnChanges, OnDestroy {
    @Input() public chartType: MonitorChartType;
    public title = "";
    public type = "line";
    public datasets: Chart.ChartDataSets[];
    public options = {};
    public timeframe: MonitorChartTimeFrame = MonitorChartTimeFrame.Hour;

    private _sub: Subscription;
    private _observable: Observable<Metric[]>;
    constructor(private monitor: MonitorHttpService, private contextMenuService: ContextMenuService) {
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
        if (this._observable) {
            this._destroySub();
            this._sub = this._observable.subscribe(metrics => {
                this.datasets = metrics.map((metric: Metric): Chart.ChartDataSets => {
                    return {
                        data: metric.data.map(data => {
                            return {
                                x: data.timeStamp,
                                y: data.total || 0,
                            } as Chart.ChartPoint;
                        }),
                        fill: false,
                        label: metric.name.localizedValue,
                        borderWidth: 1,

                        // none of them are working
                        // borderColor: metric.color,
                        // backgroundColor: metric.color,
                        // pointBackgroundColor: metric.color,
                        // pointBorderColor: metric.color,
                        // pointHoverBorderColor: metric.color,
                    } as Chart.ChartDataSets;
                });
            });
        }
    }

    public openTimeFramePicker() {
        const items = [
            new ContextMenuItem({ label: "Past hour", click: () => {
                this.timeframe = MonitorChartTimeFrame.Hour;
                this.monitor.updateTimeFrame(this.timeframe, this.chartType);
                this.fetchObservable();
            }}),
            new ContextMenuItem({ label: "Past day", click: () => {
                this.timeframe = MonitorChartTimeFrame.Day;
                this.monitor.updateTimeFrame(this.timeframe, this.chartType);
                this.fetchObservable();
            }}),
            new ContextMenuItem({ label: "Past week", click: () => {
                this.timeframe = MonitorChartTimeFrame.Week;
                this.monitor.updateTimeFrame(this.timeframe, this.chartType);
                this.fetchObservable();
            }}),
        ];
        this.contextMenuService.openMenu(new ContextMenu(items));
    }

    private _getChartObservable(): Observable<Metric[]> {
        let observable: Observable<Metric[]>;
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
                display: true,
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    fontSize: 10,
                },
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
                }],
            },
        };
    }

    private _destroySub() {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }
}
