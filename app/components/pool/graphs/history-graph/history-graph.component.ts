import { Component, Input, OnChanges } from "@angular/core";
import { HistoryItem } from "app/components/pool/graphs/history-data/history-data-base";
import * as moment from "moment";

@Component({
    selector: "bl-history-graph",
    templateUrl: "history-graph.html",
})
export class HistoryGraphComponent implements OnChanges {
    @Input() public max: number = 1;

    @Input() public history: HistoryItem[] = [];

    @Input() public interactive = true;

    @Input() public historySize = 10;

    public type = "line";

    public datasets: Chart.ChartDataSets[] = [];

    public options = {};

    constructor() {
        this.updateData();
        this.updateOptions();

        setInterval(() => {
            this.updateData();
        }, 5000);
    }

    public ngOnChanges(inputs) {
        if (inputs.history || inputs.historySize) {
            this.updateData();
        }

        if (inputs.max || inputs.historySize) {
            this.updateOptions();
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 10 : 0;
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: { radius: 0, hitRadius: hitRadius, hoverRadius: hitRadius },
                line: {
                    tension: 0.05, // disables bezier curves
                },
            },
            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    display: this.interactive,
                    ticks: {
                        max: this.max * 1.01, // Need to have max slightly more otherwise the line get's cut.
                        min: 0,
                        autoSkip: true,
                        callback: (value) => { if (value % 1 === 0) { return value; } },
                    },
                }],
                xAxes: [{
                    type: "linear",
                    position: "bottom",
                    display: this.interactive,
                    ticks: {
                        max: 0,
                        min: -100,
                        stepSize: 100,
                        callback: (value) => {
                            if (value === 0) {
                                return "0";
                            } else {
                                return `${this.historySize}m`;
                            }
                        },
                    },
                }],
            },
        };
    }

    /**
     * Transform the input data into datasets for the chart.
     */
    public updateData() {
        const minToMilli = 60 * 1000;
        const max = this.historySize * minToMilli / 100;
        const now = moment();
        const last = this.history.last();
        this.datasets = [
            {
                data:
                [
                    ...this.history.map(x => {
                        const val = moment(x.time).diff(now);
                        return {
                            x: val / max,
                            y: x.y,
                        };
                    }),
                    {
                        x: 0,
                        y: last && last.y,
                    },
                ],
            },
        ];
    }
}
