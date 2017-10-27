import { BehaviorSubject, Observable } from "rxjs";

import { Pool } from "app/models";
import {
    BatchPerformanceMetricType, BatchPerformanceMetrics, PerformanceMetric,
} from "app/models/app-insights/metrics-result";
import { AppInsightsQueryService } from "app/services";

export class PerformanceData {
    public pool: Pool;
    public historySize: number = 10;

    private _metrics = new BehaviorSubject<BatchPerformanceMetrics>({} as any);

    constructor(private appInsightsQueryService: AppInsightsQueryService) {
    }

    public update() {
        const appId = "16e28541-cfd6-4848-976a-e6ac393aa4f3";
        this.appInsightsQueryService.getPoolPerformance(appId, this.pool.id, this.historySize).subscribe((metrics) => {
            this._metrics.next(metrics);
        });
    }

    public observeMetric(name: BatchPerformanceMetricType): Observable<PerformanceMetric[]> {
        return this._metrics.map((metrics) => {
            return metrics[name] || [];
        });
    }
}
