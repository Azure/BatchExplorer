import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { Job, Task } from "app/models";
import { DateUtils, NumberUtils } from "app/utils";
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

    private _sortedEndTimes: any[];
    private _sortedStartTimes: any[];

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
                    title: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems[0]);
                    },
                    label: () => null,
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
                    scaleLabel: {
                        display: true,
                        labelString: "Time since the job started.",
                    },
                }],
                yAxes: [{
                    type: "linear",
                    scaleLabel: {
                        display: true,
                        labelString: "Task count",
                    },
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
                task: task,
            });

            endTimes.push({
                time: moment(endTime).diff(jobStartTime) / 1000,
                index: index,
                task: task,
            });
        });

        const sortedStartTimes = this._sortedStartTimes = startTimes.sort((a, b) => a.time - b.time);
        const sortedEndTimes = this._sortedEndTimes = endTimes.sort((a, b) => a.time - b.time);

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

    private _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const x = parseInt(tooltipItem.xLabel, 10);
        let type: string;
        let task: Task;
        const time = DateUtils.prettyDuration(moment.duration({ seconds: x }));
        if (tooltipItem.datasetIndex === 0) {
            task = this._sortedStartTimes[tooltipItem.index].task;
            type = "task started ";
        } else {
            task = this._sortedEndTimes[tooltipItem.index].task;
            type = "task completed";
        }

        const taskCount = parseInt(tooltipItem.yLabel, 10);
        const taskId = task ? task.id : "?";
        return [`${NumberUtils.nth(taskCount)} ${type} at ${time}`, `Task id: ${taskId}`];
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
