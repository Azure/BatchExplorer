import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Pool } from "app/models";
import { log } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy, RxEntityProxy, RxListProxy, getOnceProxy } from "./core";
import { ServiceBase } from "./service-base";

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

    constructor(batchService: BatchClientService) {
        super(batchService);
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public add(pool: any, options: any = {}): Observable<any> {
        return this.callBatchClient((client) => client.pool.add(pool, options), (error) => {
            log.error("Error adding pool", Object.assign({}, error));
        });
    }

    public list(initialOptions: any = {}): RxListProxy<{}, Pool> {
        return new RxBatchListProxy<{}, Pool>(Pool, this.batchService, {
            cache: () => this._cache,
            proxyConstructor: (client, params, options) => client.pool.list(options),
            initialOptions,
        });
    }

    public get(poolId: string, options: any = {}): RxEntityProxy<PoolParams, Pool> {
        return new RxBatchEntityProxy<PoolParams, Pool>(Pool, this.batchService, {
            cache: () => this._cache,
            getFn: (client, params: PoolParams) => client.pool.get(params.id, options),
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
        let observable = this.callBatchClient((client) => client.pool.delete(poolId, options));
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
        let observable = this.callBatchClient((client) => client.pool.resize(poolId, targetDedicated, options));
        observable.subscribe({
            error: (error) => {
                log.error("Error resizing pool: " + poolId, Object.assign({}, error));
            },
        });

        return observable;
    }

    public patch(poolId: string, attributes: any, options: any = {}) {
        return this.callBatchClient((client) => client.pool.patch(poolId, attributes, options), (error) => {
            log.error("Error patching pool: " + poolId, error);
        });
    }

    public replaceProperties(poolId: string, attributes: any, options: any = {}) {
        return this.callBatchClient((client) => client.pool.replaceProperties(poolId, attributes, options), (error) => {
            log.error("Error updating pool: " + poolId, error);
        });
    }
}
