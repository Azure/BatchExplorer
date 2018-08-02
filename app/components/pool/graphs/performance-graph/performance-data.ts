import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Node, Pool } from "app/models";
import {
    BatchPerformanceMetricType,
    BatchPerformanceMetrics,
} from "app/models/app-insights/metrics-result";
import { AppInsightsQueryService } from "app/services";
import { map, shareReplay } from "rxjs/operators";

export class PerformanceData {
    public set pool(pool: Pool) {
        this._pool = pool;
        this.retrieveAppId();
    }
    public get pool() { return this._pool; }

    public node: Node;

    public historySize: number = 10;
    public appId: string = null;
    public loading: Observable<any>;
    private _metrics = new BehaviorSubject<BatchPerformanceMetrics>({} as any);
    private _loading = new AsyncSubject();
    private _pool: Pool;
    private _firstLoad = false;

    constructor(private appInsightsQueryService: AppInsightsQueryService) {
        this.loading = this._loading.asObservable();
    }

    public update() {
        if (!this.appId) {
            return;
        }
        let obs;

        if (this.node) {
            obs = this.appInsightsQueryService.getNodePerformance(
                this.appId, this.pool.id,
                this.node.id, this.historySize);
        } else {
            obs = this.appInsightsQueryService.getPoolPerformance(this.appId, this.pool.id, this.historySize);
        }

        obs.subscribe((metrics) => {
            this._metrics.next(metrics);
            if (this._firstLoad) {
                this._firstLoad = false;
                this._loading.next(true);
                this._loading.complete();
            }
        });
    }

    public observeMetric<T = any>(name: BatchPerformanceMetricType): Observable<T> {
        return this._metrics.pipe(
            map((metrics) => metrics[name] || []),
            shareReplay(1),
        );
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
