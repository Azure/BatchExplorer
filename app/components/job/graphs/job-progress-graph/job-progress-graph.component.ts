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
            backgroundColor: "rgba(170, 57, 57, 0.4)",
            pointBackgroundColor: "#aa3939", // Start time colors(red)
            pointBorderColor: "#aa3939",
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
        const hitRadius = this.interactive ? 3 : 0;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            legend: {
                display: false,
            },
            elements: {
                point: {
                    radius: 1,
                    hitRadius: hitRadius,
                    hoverRadius: hitRadius,
                },
                // line: {
                //     backgroundColor: "rgba(0, 0, 0 ,0)",
                //     borderWidth: 0,
                //     borderColor: "rgba(0, 0, 0, 0)",
                //     fill: false,
                // },
            },
            tooltips: {
                enabled: true,
                mode: "single",
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
                }],
                yAxes: [{
                    // type: "linear",
                    // ticks: {
                    //     min: 0,
                    //     callback: (value) => {
                    //         if (value > 180) {
                    //             if (value % 60 === 0) {
                    //                 return value / 60 + "m";
                    //             }
                    //         } else {
                    //             if (value % 1 === 0) {
                    //                 return value + "s";
                    //             }
                    //         }
                    //     },
                    // },
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

            startTimes.push(moment(startTime).diff(jobStartTime) / 1000);

            endTimes.push(moment(endTime).diff(jobStartTime) / 1000);
        });

        const sortedStartTimes = startTimes.sort((a, b) => a - b);
        const sortedEndTimes = endTimes.sort((a, b) => a - b);

        console.log("Start sorted", sortedEndTimes);
        this.datasets = [
            {
                label: "Starttime",
                data: this._timesToDataSet(sortedStartTimes),
            },
            {
                label: "EndTime",
                data: this._timesToDataSet(sortedEndTimes),
            },
        ];
    }

    private _getToolTip(datasetIndex: number, index: number) {
        if (datasetIndex === 0) {
            return "Task started";
        } else {
            return "Task completed";
        }
    }

    private _timesToDataSet(times: number[]) {
        return times.map((time, index) => {
            return {
                x: index,
                y: Math.round(time),
            };
        });
    }
}
