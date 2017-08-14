import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Pool } from "app/models";
import { PoolCreateDto,  PoolEnableAutoScaleDto, PoolPatchDto, PoolResizeDto } from "app/models/dtos";
import { Constants, ModelUtils, log } from "app/utils";
import { List } from "immutable";
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

    public add(pool: PoolCreateDto, options: any = {}): Observable<any> {
        return this.callBatchClient((client) => client.pool.add(pool.toJS(), options), (error) => {
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
            poll: Constants.PollRate.entity,
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

    public resize(poolId: string, target: PoolResizeDto, options: any = {}) {
        return this.callBatchClient((client) => client.pool.resize(poolId, target.toJS(), options), (error) => {
            log.error("Error resizing pool: " + poolId, Object.assign({}, error));
        });
    }

    public patch(poolId: string, attributes: PoolPatchDto, options: any = {}) {
        return this.callBatchClient(client => client.pool.patch(poolId, attributes.toJS(), options), (error) => {
            log.error("Error patching pool: " + poolId, error);
        });
    }

    public replaceProperties(poolId: string, attributes: PoolPatchDto, options: any = {}) {
        return this.callBatchClient(client => client.pool.replaceProperties(poolId, attributes.toJS(), options),
            (error) => {
                log.error("Error updating pool: " + poolId, error);
            });
    }

    public updateTags(pool: Pool, tags: List<string>) {
        const attributes = new PoolPatchDto({
            metadata: ModelUtils.updateMetadataWithTags(pool.metadata, tags),
        });
        return this.patch(pool.id, attributes);
    }

    public enableAutoScale(poolId: string, autoscaleParams: PoolEnableAutoScaleDto) {
        return this.callBatchClient((client) => client.pool.enableAutoScale(poolId, autoscaleParams), (error) => {
            log.error("Error enabling autoscale for pool: " + poolId, error);
        });
    }

    public disableAutoScale(poolId: string) {
        return this.callBatchClient((client) => client.pool.disableAutoScale(poolId), (error) => {
            log.error("Error disabling autoscale for pool: " + poolId, error);
        });
    }
}
