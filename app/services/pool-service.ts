import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Pool } from "app/models";
import { PoolCreateDto, PoolEnableAutoScaleDto, PoolPatchDto, PoolResizeDto } from "app/models/dtos";
import { BatchEntityGetter } from "app/services/core";
import { EntityView } from "app/services/core/data";
import { Constants, ModelUtils, log } from "app/utils";
import { List } from "immutable";
import { BatchClientService } from "./batch-client.service";
import { DataCache, RxBatchListProxy, RxListProxy, BatchListGetter } from "./core";
import { ServiceBase } from "./service-base";

export interface PoolListParams { }

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

    private _getter: BatchEntityGetter<Pool, PoolParams>;
    private _listGetter: BatchListGetter<Pool, PoolListParams>;

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(Pool, this.batchService, {
            cache: () => this._cache,
            getFn: (client, params: PoolParams) => client.pool.get(params.id),
        });

        this._listGetter = new BatchListGetter(Pool, this.batchService, {
            cache: () => this._cache,
            list: (client, params: PoolListParams, options) => client.pool.list(options),
            listNext: (client, nextLink: string) => client.pool.listNext(nextLink),
        });

        this._listGetter.fetch({}).subscribe({
            next: (pools) => {
                console.log("Got pools??", pools);
            },
            error: (err) => console.log("erro", err),
        });
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

    public listOnce(options?: any, forceNew?: boolean);
    public listOnce(nextLink: string);
    public listOnce() {
        return this._listGetter.fetch(args);
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

    public evaluateAutoScale(poolId: string, options: any = {}) {
        return this.callBatchClient((client) => client.pool.evaluateAutoScale(poolId, options), (error) => {
            log.error("Error resizing pool: " + poolId, Object.assign({}, error));
        });
    }

    public disableAutoScale(poolId: string) {
        return this.callBatchClient((client) => client.pool.disableAutoScale(poolId), (error) => {
            log.error("Error disabling autoscale for pool: " + poolId, error);
        });
    }
}
