import { HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    HttpCode,
    HttpRequestOptions,
    ListOptionsAttributes,
    ListResponse,
    ListView,
    ServerError,
} from "@batch-flask/core";
import { AutoScaleFormulaEvaluation, NameValuePair, Pool } from "app/models";
import { PoolCreateDto, PoolEnableAutoScaleDto, PoolPatchDto, PoolResizeDto } from "app/models/dtos";
import { ModelUtils } from "app/utils";
import { Constants } from "common";
import { List } from "immutable";
import { Observable, Subject, of, throwError } from "rxjs";
import { catchError, map, share, switchMap } from "rxjs/operators";
import { AzureBatchHttpService, BatchEntityGetter, BatchListGetter } from "../core";

export interface PoolListParams { }

export interface PoolParams {
    id?: string;
}

@Injectable({ providedIn: "root" })
export class PoolService implements OnDestroy {

    public get basicProperties(): string {
        return this._basicProperties;
    }
    /**
     * Triggered only when a pool is added through this app.
     * Used to notify the list of a new item
     */
    public onPoolAdded = new Subject<string>();

    public pools: Observable<List<Pool>>;
    public listView: ListView<Pool, PoolListParams>;

    private _basicProperties: string = "id,displayName,state,allocationState";
    private _cache = new DataCache<Pool>();

    private _getter: BatchEntityGetter<Pool, PoolParams>;
    private _listGetter: BatchListGetter<Pool, PoolListParams>;

    constructor(private http: AzureBatchHttpService) {
        this._getter = new BatchEntityGetter(Pool, this.http, {
            cache: () => this._cache,
            uri: (params: PoolParams) => `/pools/${params.id}`,
        });

        this._listGetter = new BatchListGetter(Pool, this.http, {
            cache: () => this._cache,
            uri: () => `/pools`,
        });

        this.listView = this._createListView();

        this.onPoolAdded.subscribe((poolId) => {
            this.listView.loadNewItem(this.get(poolId));
        });

        this.pools = new Observable(
            observer => this.listView.fetchAll().subscribe(observer)
        ).pipe(
            switchMap(() => this.listView.refreshAll()),
            share(),
        );
    }

    public ngOnDestroy() {
        this.listView.dispose();
    }

    public exist(params: PoolParams): Observable<boolean> {
        return this.http.head(`/pools/${params.id}`).pipe(
            map(_ => true),
            catchError((error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    return of(false);
                } else {
                    return throwError(error);
                }
            }),
        );
    }

    public add(pool: PoolCreateDto, options: any = {}): Observable<any> {
        return this.http.post("/pools", pool.toJS());
    }

    public list(options?: ListOptionsAttributes, forceNew?: boolean): Observable<ListResponse<Pool>>;
    public list(nextLink: ContinuationToken): Observable<ListResponse<Pool>>;
    public list(nextLinkOrOptions: any, options = {}, forceNew = false): Observable<ListResponse<Pool>> {
        if (nextLinkOrOptions && nextLinkOrOptions.nextLink) {
            return this._listGetter.fetch(nextLinkOrOptions);
        } else {
            return this._listGetter.fetch({}, options, forceNew);
        }
    }

    public refresh() {
        return this.listView.refreshAll();
    }

    /**
     * Retrieve a pool
     * @param id Id of the pool
     * @param options Options
     */
    public get(id: string, options: any = {}): Observable<Pool> {
        return this._getter.fetch({ id });
    }

    /**
     * Retrieve a pool from the cache
     * @param id Id of the pool
     * @param options Options
     */
    public getFromCache(id: string): Observable<Pool> {
        return this._getter.fetch({ id }, { cached: true });
    }

    /**
     * Create an entity view for a pool
     */
    public view(): EntityView<Pool, PoolParams> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    /**
     * This will start the delete process
     */
    public delete(poolId: string): Observable<any> {
        return this.http.delete(`/pools/${poolId}`);
    }

    /**
     *
     */
    public notifyPoolDeleted(poolId) {
        this._cache.deleteItemByKey(poolId);
    }

    public resize(poolId: string, target: PoolResizeDto, options: any = {}) {
        return this.http.post(`/pools/${poolId}/resize`, target.toJS());
    }

    /**
     * Stops an ongoing resize operation on the pool.
     * @oaram poolId Id of the pool
     * @param [timeout] Optional timeout for batch to stop the resize in seconds.
     */
    public stopResize(poolId: string, timeout?: number) {
        const options: HttpRequestOptions = {};
        if (timeout) {
            options.params = new HttpParams().set("timeout", timeout.toString());
        }
        return this.http.post(`/pools/${poolId}/stopresize`, null, options);
    }

    public patch(poolId: string, attributes: PoolPatchDto, options: any = {}) {
        return this.http.patch(`/pools/${poolId}`, attributes.toJS());
    }

    public replaceProperties(poolId: string, attributes: PoolPatchDto, options: any = {}) {
        return this.http.post(`/pools/${poolId}`, attributes.toJS());
    }

    public updateTags(pool: Pool, tags: List<string>) {
        const attributes = new PoolPatchDto({
            metadata: ModelUtils.updateMetadataWithTags(pool.metadata, tags),
        } as any);
        return this.patch(pool.id, attributes);
    }

    public enableAutoScale(poolId: string, autoscaleParams: PoolEnableAutoScaleDto) {
        return this.http.post(`/pools/${poolId}/enableautoscale`, autoscaleParams.toJS());
    }

    public evaluateAutoScale(poolId: string, formula: string): Observable<AutoScaleFormulaEvaluation> {
        return this.http.post<any>(`/pools/${poolId}/evaluateautoscale`, {
            autoScaleFormula: formula,
        }).pipe(
            map((response) => {
                const results = this._parseAutoScaleResults(response.results);
                return new AutoScaleFormulaEvaluation({
                    results: results,
                    error: response.error && ServerError.fromBatchBody(response.error),
                });
            }),
        );
    }

    public disableAutoScale(poolId: string) {
        return this.http.post(`/pools/${poolId}/disableautoscale`, null);
    }

    private _createListView(options: ListOptionsAttributes = {}): ListView<Pool, PoolListParams> {
        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    private _parseAutoScaleResults(results: string): NameValuePair[] {
        if (!results) { return []; }
        return results.split(";")
            .filter(x => x !== "")
            .map((result) => {
                const [name, value] = result.split("=", 2);
                return new NameValuePair({ name, value });
            });
    }
}
