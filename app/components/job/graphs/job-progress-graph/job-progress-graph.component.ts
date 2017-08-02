import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job, Task } from "app/models";
import "./job-progress-graph.scss";

@Component({
    selector: "bl-job-progress-graph",
    templateUrl: "job-progress-graph.html",
})
export class JobProgressGraphComponent implements OnChanges {
    @Input() public interactive: boolean = true;
    @Input() public job: Job;
    @Input() public tasks: List<Task> = List([]);

    public type = "line";

    public colors: any[] = [
        {
            backgroundColor: "rgba(76, 175, 80, 0.4)",
            pointBackgroundColor: "#4caf50", // End time colors(green)
            pointBorderColor: "#4caf50",
        },
        {
            backgroundColor: "rgba(76, 175, 80, 0.4)",
            pointBackgroundColor: "#4caf50", // End time colors(green)
            pointBorderColor: "#4caf50",
        },
    ];

    public datasets: Chart.ChartDataSets[] = [];

    public options: Chart.ChartOptions;

    public loading = false;

    constructor() {
        this.updateOptions();
        this.updateData();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.tasks) {
            this.updateData();
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 5 : 0;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            legend: {
                display: false,
            },
            elements: {
                point: {
                    radius: 0,
                    hitRadius: hitRadius,
                    hoverRadius: hitRadius,
                },
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
            tooltips: {
                enabled: true,
                mode: "nearest",
                callbacks: {
                    label: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems.datasetIndex, tooltipItems.index);
                    },
                },
            },
            scales: {
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                    ticks: {
                        min: 0,
                        callback: (value) => {
                            if (value > 180) {
                                if (value % 60 === 0) {
                                    return value / 60 + "m";
                                }
                            } else {
                                if (value % 1 === 0) {
                                    return value + "s";
                                }
                            }
                        },
                    },
                }],
                yAxes: [{
                    type: "linear",
                }],
            },
        };
    }

    public updateData() {
        if (!this.job) {
            return;
        }
        const jobStartTime = moment(this.job.executionInfo.startTime);
        const startTimes = [];
        const endTimes = [];
        this.tasks.forEach((task, index) => {
            if (!task.executionInfo || !task.executionInfo.endTime) {
                return;
            }
            const { startTime, endTime } = task.executionInfo;

            startTimes.push({
                time: moment(startTime).diff(jobStartTime) / 1000,
                index: index,
            });

            endTimes.push({
                time: moment(endTime).diff(jobStartTime) / 1000,
                index: index,
            });
        });

        const sortedStartTimes = startTimes.sort((a, b) => a.time - b.time);
        const sortedEndTimes = endTimes.sort((a, b) => a.time - b.time);

        console.log("Start sorted", sortedEndTimes);
        this.datasets = [
            {
                label: "Starttime",
                data: this._timesToDataSet(sortedStartTimes),
                fill: "1",
            },
            {
                label: "EndTime",
                data: this._timesToDataSet(sortedEndTimes),
                fill: false,
            },
        ] as any;
    }

    private _getToolTip(datasetIndex: number, index: number) {
        if (datasetIndex === 0) {
            return "Task started";
        } else {
            return "Task completed";
        }
    }

    private _timesToDataSet(times: any[]) {
        return times.map((data, index) => {
            return {
                y: index,
                x: Math.round(data.time),
            };
        });
    }
}
