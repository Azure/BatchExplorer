import { BehaviorSubject, Observable } from "rxjs";

import { HistoryItem } from "app/components/pool/graphs/history-data/history-data-base";
import { Pool } from "app/models";
import { AppInsightsTable } from "app/models/app-insights/query-result";
import { AppInsightsQueryService } from "app/services";

export class PerformanceData {
    public pool: Pool;

    private _metrics = new BehaviorSubject(new Map<string, HistoryItem[]>());
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

    public observeMetric(name: string): Observable<HistoryItem[]> {
        return this._metrics.map(metrics => metrics.get(name));
    }

    private _extractMetric() {
        const rows = this._table.rows;
        if (!rows) {
            console.log("No rows...");
            return;
        }
        const metrics = new Map<string, HistoryItem[]>();

        for (let row of rows) {
            const [name, value, timestamp] = row;
            if (!metrics.has(name)) {
                metrics.set(name, []);
            }
            const array = metrics.get(name);
            array.push({
                time: timestamp,
                y: value,
            });
        }

        this._metrics.next(metrics);
    }

}
