import { Component, OnChanges } from "@angular/core";
import { AppInsightsPerformanceMetrics } from "../performance-data";
import { BatchUsageMetrics, PerformanceGraphComponent } from "../performance-graph.component";

import "./cpu-usage-graph.scss";

interface CpuUsage {
    time: Date;
    value: number;
    cpuCount: number;
    usages: number[];
}

@Component({
    selector: "bl-cpu-usage-graph",
    templateUrl: "cpu-usage-graph.html",
})
export class CpuUsageGraphComponent extends PerformanceGraphComponent implements OnChanges {
    public max = 100;
    public unit = "%";
    public metric = BatchUsageMetrics.cpu;

    public cpuUsages: CpuUsage[] = [];
    public showOverallUsage = true;
    public lastCpuUsage: CpuUsage;

    constructor() {
        super();
    }

    public ngOnChanges(changes) {
        super.ngOnChanges(changes);

        if (changes.data) {
            this._metricSubs.push(this.data.observeMetric(AppInsightsPerformanceMetrics.cpuUsage).subscribe((data) => {
                this.cpuUsages = data.map((usage) => {
                    const details = JSON.parse(usage.details);
                    return {
                        time: usage.time,
                        value: usage.value,
                        cpuCount: Number(details["cpu_count"]),
                        usages: this._parseIndividualCpuUsage(details["usages"]),
                    };
                });
                this.lastCpuUsage = this.cpuUsages.last();
                this._updateStatus();
                this.updateData();
            }));
        }
    }

    public updateData() {
        if (this.showOverallUsage) {
            this._showOverallCpuUsage();
        } else {
            this._showIndiviualCpuUsage();
        }
    }

    public changeShowOverallUsage(newValue) {
        this.showOverallUsage = newValue;
        this.updateData();
    }

    private _parseIndividualCpuUsage(value: string) {
        return value.split(",").map(x => Number(x));
    }
    private _showOverallCpuUsage() {
        this.datasets = [
            {
                data: [
                    ...this.cpuUsages.map(x => {
                        return {
                            x: x.time,
                            y: x.value,
                        };
                    }),
                ],
                fill: false,
                borderWidth: 1,
            },
        ];
    }

    private _showIndiviualCpuUsage() {
        if (this.cpuUsages.length === 0) {
            this._showOverallCpuUsage();
            return;
        }

        const cpuCount = this.cpuUsages.first().cpuCount;

        this.datasets = new Array(cpuCount).fill(0).map((_, cpuN) => {
            return {
                data: this.cpuUsages.map(x => {
                    return {
                        x: x.time,
                        y: x.usages[cpuN],
                    };
                }),
                fill: false,
                borderWidth: 1,
            };
        });
    }

    private _updateStatus() {
        if (this.lastCpuUsage) {
            this.status.next(`${this.lastCpuUsage.value}%`);
        } else {
            this.status.next("- %");
        }
    }
}
