import { BehaviorSubject, Observable } from "rxjs";

import { Pool } from "app/models";
import {
    BatchPerformanceMetricType, BatchPerformanceMetrics, PerformanceMetric,
} from "app/models/app-insights/metrics-result";
import { AppInsightsQueryService } from "app/services";
import { log } from "app/utils";

export class PerformanceData {
    public set pool(pool: Pool) {
        this._pool = pool;
        this.retrieveAppId();
    }
    public get pool() { return this._pool; }

    public historySize: number = 10;
    public appId: string = null;
    private _metrics = new BehaviorSubject<BatchPerformanceMetrics>({} as any);
    private _pool: Pool;

    constructor(private appInsightsQueryService: AppInsightsQueryService) {
    }

    public update() {
        if (!this.appId) {
            return;
        }
        this.appInsightsQueryService.getPoolPerformance(this.appId, this.pool.id, this.historySize)
            .subscribe((metrics) => {
                this._metrics.next(metrics);
            });
    }

    public observeMetric(name: BatchPerformanceMetricType): Observable<PerformanceMetric[]> {
        return this._metrics.map((metrics) => {
            return metrics[name] || [];
        });
    }

    public retrieveAppId() {
        const startTask = this.pool.startTask;
        this.appId = null;
        if (!startTask || startTask.environmentSettings.size === 0) {
            return;
        }

        startTask.environmentSettings.forEach(({ name, value }) => {
            if (name === "APP_INSIGHTS_APP_ID") {
                this.appId = value;
                return;
            }
        });
    }
}
