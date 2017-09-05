import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "app/components/base/context-menu";
import { Job } from "app/models";
import { DateUtils } from "app/utils";

import "./jobs-running-time-graph.scss";

@Component({
    selector: "bl-jobs-running-time-graph",
    templateUrl: "jobs-running-time-graph.html",
})
export class JobsRunningTimeComponent implements OnInit, OnChanges {
    @Input() public jobs: List<Job> = List([]);

    public chartType = "bar";
    public datasets: Chart.ChartDataSets[] = [];
    public labels: string[] = [];
    public options: Chart.ChartOptions = {};
    public jobHiddenCount = 0;

    private _displayedJobs: List<Job> = List([]);

    constructor(private contextMenuService: ContextMenuService) { }

    public ngOnInit() {
        this.updateOptions();
    }

    public ngOnChanges(changes) {
        if (changes.jobs) {
            this._displayedJobs = this.jobs;
            this._updateData();
        }
    }

    public updateOptions() {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            legend: {
                display: false,
            },
            tooltips: {
                enabled: true,
                mode: "single",
                callbacks: {
                    title: (tooltipItems, data) => {
                        return this._getToolTip(tooltipItems[0]);
                    },
                    label: () => null,
                },
            },
            scales: {
                xAxes: [{
                    display: false,
                }],
                yAxes: [{
                    type: "linear",
                    ticks: {
                        min: 0,
                        callback: (value) => {
                            const seconds = Math.floor(value / 1000);
                            if (seconds > 180) {
                                if (seconds % 60 === 0) {
                                    return seconds / 60 + "m";
                                }
                            } else {
                                if (seconds % 1 === 0) {
                                    return seconds + "s";
                                }
                            }
                        },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Running time",
                    },
                }],
            },
        };
    }

    public showContextMenu(element) {
        console.log("Elemn", element);
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Hide", () => this._hideAt(element._index)),
        ]));
    }

    public resetHiddenJobs() {
        this.jobHiddenCount = 0;
        this._displayedJobs = this.jobs;
        this._updateData();
    }

    private _updateData() {
        const data = this._displayedJobs.map((job) => {
            return moment(job.executionInfo.endTime).diff(job.executionInfo.startTime);
        }).toArray();
        this.labels = this._displayedJobs.map(x => x.id).toArray();
        this.datasets = [
            {
                label: "Running time",
                data: data,
            },
        ] as any;
    }

    private _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const job = this.jobs.get(tooltipItem.index);
        const runningTime = moment.duration(moment(job.executionInfo.endTime).diff(job.executionInfo.startTime));
        return [
            `Job id: ${job.id}`,
            `Running time: ${DateUtils.prettyDuration(runningTime, true)}`,
        ];
    }

    private _hideAt(index) {
        this.jobHiddenCount++;
        this._displayedJobs = this._displayedJobs.remove(index);
        this._updateData();
    }
}
