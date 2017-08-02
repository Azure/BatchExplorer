import { Component, Input } from "@angular/core";
import { List } from "immutable";

import { Job, Task } from "app/models";
import "./tasks-running-time-graph.scss";

@Component({
    selector: "bl-tasks-running-time-graph",
    templateUrl: "tasks-running-time-graph.html",
})
export class TasksRunningTimeGraphComponent {
    public labels: string[];
    @Input() public interactive: boolean = true;
    @Input() public job: Job;

    public type = "scatter";

    public datasets: Chart.ChartDataSets[] = [];

    public options: Chart.ChartOptions;

    private _tasks: List<Task> = List([]);

    constructor() {
        const tasks = [];

        for (let i = 0; i < 10; i++) {
            tasks.push(new Task({
                id: `Task_${i}`,
                executionInfo: { startTime: new Date(), endTime: new Date(), exitCode: 0 },
            } as any));
        }
        this._tasks = List(tasks);
        this.updateOptions();
        this.updateData();
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 3 : 0;
        this.options = {
            responsive: true,
            legend: {
                display: false,
            },
            elements: {
                point: {
                    radius: 1,
                    hitRadius: hitRadius,
                    hoverRadius: hitRadius,
                },
                line: {
                    backgroundColor: "rgba(0, 0, 0 ,0)",
                    borderWidth: 0,
                    borderColor: "rgba(0, 0, 0, 0)",
                    fill: false,
                },
            },
            tooltips: {
                enabled: true,
                mode: "single",
                callbacks: {
                    label: (tooltipItems, data) => {
                        console.log(tooltipItems, data);
                        const task = this._tasks.get(tooltipItems.index);
                        return task ? task.id : "???";
                    },
                },
            },
            scales: {
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                }],
                yAxes: [{
                    type: "linear",
                    ticks: {
                        min: 0,
                        callback: (value) => { if (value % 1 === 0) { return value; } },
                    },
                }],
            },
        };
    }

    public updateData() {
        this.labels = this._tasks.map(x => x.id + "x").toArray();
        this.datasets = [{
            label: "Task running time",
            data: this._tasks.map((x, i) => {
                return {
                    labelString: "Banana",
                    x: i,
                    y: (Math.random() ** 2) * 50 + 30,
                };
            }).toArray(),
        }];
        console.log("Data set is ", this.datasets);
    }
}
