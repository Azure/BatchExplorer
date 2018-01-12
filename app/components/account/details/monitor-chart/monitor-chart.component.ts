import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { Metric, MonitorHttpService } from "app/services";

import "./monitor-chart.scss";

export enum MonitorChartType {
    CoreCount = "coreCount",
    FailedTask = "failedTask",
    NodeStates = "nodeStates",
    TaskStates = "taskStates",
}

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

    private _sub: Subscription;

    constructor(private monitor: MonitorHttpService) {
        this._setChartOptions();
    }

    public ngOnChanges(changes): void {
        if (changes.chartType) {
            let observable = this._getChartObservable();
            if (observable) {
                this._sub = observable.subscribe(metrics => {
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
                        } as Chart.ChartDataSets;
                    });
                });
            }
        }
    }

    public ngOnDestroy(): void {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }

    private _getChartObservable(): Observable<Metric[]> {
        let observable: Observable<Metric[]>;
        switch (this.chartType) {
            case MonitorChartType.CoreCount:
                this.title = "Core count";
                observable = this.monitor.coreCounts;
                break;
            case MonitorChartType.FailedTask:
                this.title = "Failed task";
                observable = this.monitor.failedTask;
                break;
            case MonitorChartType.NodeStates:
                this.title = "Node states";
                observable = this.monitor.nodeStates;
                break;
            case MonitorChartType.TaskStates:
                this.title = "Task states";
                observable = this.monitor.taskStates;
                break;
        }
        return observable;
    }

    private _setChartOptions() {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: { radius: 0, hitRadius: 10, hoverRadius: 3 },
                line: { tension: 0.05 },
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
}
