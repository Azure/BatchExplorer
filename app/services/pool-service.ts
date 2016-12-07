import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { log } from "app/utils";
import BatchClient from "../api/batch/batch-client";
import { Pool } from "../models";
import { DataCache, RxEntityProxy, RxListProxy, getOnceProxy } from "./core";
import ServiceBase from "./service-base";

export interface PoolParams {
    id?: string;
}

@Injectable()
export class PoolService extends ServiceBase {
    /**
     * Triggered only when a pool is added through this app.
     * Used to notify the list of a new item
     */
    public onPoolAdded = new Subject<string>();

    private _basicProperties: string = "id,displayName,state,allocationState";
    private _cache = new DataCache<Pool>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public add(pool: any, options: any = {}): Observable<any> {
        return Observable.fromPromise<any>(BatchClient.pool.add(pool, options));
    }

    public list(initialOptions: any = {}): RxListProxy<{}, Pool> {
        return new RxListProxy<{}, Pool>(Pool, {
            cache: () => this._cache,
            proxyConstructor: (params, options) => BatchClient.pool.list(options),
            initialOptions,
        });
    }

    public get(poolId: string, options: any = {}): RxEntityProxy<PoolParams, Pool> {
        return new RxEntityProxy<PoolParams, Pool>(Pool, {
            cache: () => this._cache,
            getFn: (params: PoolParams) => {
                return BatchClient.pool.get(params.id, options);
            },
            initialParams: { id: poolId },
        });
    }

    public getOnce(poolId: string, options: any = {}): Observable<Pool> {
        return getOnceProxy(this.get(poolId, options));
    }

    /**
     * This will start the delete process
     */
    public delete(poolId: string, options: any = {}): Observable<any> {
        let observable = Observable.fromPromise<any>(
            BatchClient.pool.delete(poolId, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error deleting pool: " + poolId, Object.assign({}, error));
            },
        });

        return observable;
    }

    /**
     *
     */
    public notifyPoolDeleted(poolId) {
        this._cache.deleteItemByKey(poolId);
    }

    public resize(poolId: string, targetDedicated: number, options: any = {}) {
        let observable = Observable.fromPromise<any>(
            BatchClient.pool.resize(poolId, targetDedicated, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error resizing pool: " + poolId, Object.assign({}, error));
            },
        });

        return observable;
    }
}
