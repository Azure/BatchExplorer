import { Component, HostBinding, Input, OnChanges, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { List } from "immutable";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { Job } from "app/models";

import "./jobs-bar-chart.scss";

@Component({
    selector: "bl-jobs-bar-chart",
    templateUrl: "jobs-bar-chart.html",
})
export class JobsBarChartComponent implements OnInit, OnChanges {
    @Input() public label: string;
    @Input() public jobs: List<Job> = List([]);
    @Input() public computeDataSets: (displayedJobs: List<Job>) => Chart.ChartDataSets[];
    @Input() public getTooltip: (job: Job) => string[];

    @HostBinding("class.job-bar-chart") public cssCls = true;

    public colors: any[] = [
        {
            backgroundColor: "rgba(76, 175, 80, 0.4)",
        },
        {
            backgroundColor: "rgba(170, 57, 57, 0.4)",
        },
    ];

    public chartType = "bar";
    public datasets: Chart.ChartDataSets[] = [];
    public labels: string[] = [];
    public options: Chart.ChartOptions = {};
    public jobHiddenCount = 0;

    private _displayedJobs: List<Job> = List([]);

    constructor(private contextMenuService: ContextMenuService, private router: Router) { }

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
                    stacked: true,
                }],
                yAxes: [{
                    type: "linear",
                    stacked: true,
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
                    },
                }],
            },
        };
    }

    public showContextMenu(element) {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Go to", () => this._goto(element._index)),
            new ContextMenuItem("Hide", () => this._hideAt(element._index)),
        ]));
    }

    public resetHiddenJobs() {
        this.jobHiddenCount = 0;
        this._displayedJobs = this.jobs;
        this._updateData();
    }

    private _updateData() {
        this.labels = this._displayedJobs.map(x => x.id).toArray();
        this.datasets = this.computeDataSets(this._displayedJobs);
    }

    private _getToolTip(tooltipItem: Chart.ChartTooltipItem) {
        const job = this._displayedJobs.get(tooltipItem.index);
        return this.getTooltip(job);
    }

    private _goto(index) {
        const job = this._displayedJobs.get(index);
        this.router.navigate(["/jobs", job.id]);
    }

    private _hideAt(index) {
        this.jobHiddenCount++;
        this._displayedJobs = this._displayedJobs.remove(index);
        this._updateData();
    }
}
