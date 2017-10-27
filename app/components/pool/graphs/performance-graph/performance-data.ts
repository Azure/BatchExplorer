import { BehaviorSubject, Observable } from "rxjs";

import { Pool } from "app/models";
import { AppInsightsTable } from "app/models/app-insights/query-result";
import { AppInsightsQueryService } from "app/services";

export enum AppInsightsPerformanceMetrics {
    cpuUsage = "Cpu usage",
    memoryAvailable = "Memory available",
    memoryUsed = "Memory used",
    diskRead = "Disk read",
    diskWrite = "Disk write",
    networkRead = "Network read",
    networkWrite = "Network write",
}

export interface PerformanceMetric {
    time: Date;
    value: number;
    details: string;
}

export class PerformanceData {
    public pool: Pool;

    private _metrics = new BehaviorSubject(new Map<string, PerformanceMetric[]>());
    private _table: AppInsightsTable;

    constructor(private appInsightsQueryService: AppInsightsQueryService) {
    }

    public update() {
        const appId = "16e28541-cfd6-4848-976a-e6ac393aa4f3";
        this.appInsightsQueryService.getPoolPerformance(appId, this.pool.id, 10).subscribe((table) => {
            console.log("Got data", table);
            this._table = table;
            this._extractMetric();
        });
    }

    public observeMetric(name: AppInsightsPerformanceMetrics): Observable<PerformanceMetric[]> {
        return this._metrics.map((metrics) => {
            return metrics.get(name) || [];
        });
    }

    private _extractMetric() {
        const rows = this._table.rows;
        if (!rows) {
            return;
        }
        const metrics = new Map<string, PerformanceMetric[]>();

        for (let row of rows) {
            const [name, value, time, details] = row;
            if (!metrics.has(name)) {
                metrics.set(name, []);
            }
            const array = metrics.get(name);
            array.push({
                time: new Date(time),
                value,
                details,
            });
        }

        this._metrics.next(metrics);
    }

}
