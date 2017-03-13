import { Component, Input, OnChanges } from "@angular/core";
import * as moment from "moment";

@Component({
    selector: "bl-history-graph",
    templateUrl: "history-graph.html",
})
export class HistoryGraphComponent implements OnChanges {
    @Input()
    public max: number = 1;

    @Input()
    public history: any[] = [];

    @Input()
    public interactive = true;

    @Input()
    public historySize = 10;

    public type = "line";

    public data: any = [];

    public options = {};

    constructor() {
        this.updateData();
        this.updateOptions();
    }

    public ngOnChanges(inputs) {
        if (inputs.history || inputs.historySize) {
            this.updateData();
            this.updateOptions();
        }

        if (inputs.max) {
            this.updateOptions();
        }
    }

    public updateOptions() {
        const hitRadius = this.interactive ? 10 : 0;
        this.options = {
            responsive: true,
            elements: { point: { radius: 0, hitRadius: hitRadius, hoverRadius: hitRadius } },
            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    type: "linear",
                    ticks: {
                        max: this.max * 1.01, // Need to have max slightly more otherwise the line get's cut.
                        min: 0,
                        autoSkip: true,
                        callback: (value) => { if (value % 1 === 0) { return value; } },
                    },
                }],
                xAxes: [{
                    // type: "time",
                    type: "linear",
                    position: "bottom",
                    // display: false,
                    // time: {
                    //     tooltipFormat: "hh:mm:ss",
                    // },
                    ticks: {
                        max: 0,
                        min: -100,
                        stepSize: 100,
                        callback: (value) => {
                            console.log("LAbel for", value);
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

    public updateData() {
        const max = this.historySize * 60 * 1000;
        this.data = [
            {
                data:
                [
                    ...this.history.map(x => {
                        console.log("MAp", moment(x.x).diff(moment()));
                        const val = moment(x.x).diff(moment());
                        return {
                            x: val / max * 100,
                            y: x.y,
                        };
                    }),
                ],
            },
        ];
    }
}
