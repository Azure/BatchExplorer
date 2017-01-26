import { Type } from "@angular/core";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { log } from "app/utils";
import { DataCache } from "./data-cache";

export interface FetchDataOptions {
    getData: () => Observable<any>;
    next: (response: any) => void;
    error?: (error: any) => void;
}
/**
 * Base proxy for List and Entity proxies
 */
export class RxProxyBase<TParams, TEntity> {
    /**
     * Status that keep track of any loading
     */
    public status: Observable<LoadingStatus>;

    /**
     * Push observable that send a notification if the item has been deleted.
     * Which means the item was previously loaded but returned a 404 on the last fetch.
     */
    public deleted: Observable<string>;

    /**
     * Status that is set to loading only when parameters change
     */
    public newDataStatus: Observable<LoadingStatus>;

    protected _status = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    protected _newDataStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);

    protected _params: TParams;
    protected _cache: DataCache<TEntity>;

    private _currentQuerySub: Subscription = null;
    private _currentObservable: Observable<any>;
    private _deletedSub: Subscription;
    private _deleted = new Subject<string>();

    constructor(private type: Type<TEntity>, protected cacheFn: (params: TParams) => DataCache<TEntity>) {
        this.status = this._status.asObservable();
        this.newDataStatus = this._newDataStatus.asObservable();

        this.status.subscribe((status) => {
            // If we were loading and the last request status change to ready or error
            if (this._newDataStatus.getValue() === LoadingStatus.Loading && status !== LoadingStatus.Loading) {
                this._newDataStatus.next(status);
            }
        });

        this.deleted = this._deleted.asObservable();
    }

    public set params(params: TParams) {
        this._params = params;
        this.cache = this.cacheFn(params);
        this.markLoadingNewData();
        this.abortFetch();
    }

    public get params() {
        return this._params;
    }

    protected set cache(cache: DataCache<TEntity>) {
        this._cache = cache;
        this._clearDeleteSub();
        this._deletedSub = cache.deleted.subscribe((x) => {
            this._deleted.next(x);
        });
    }

    protected get cache() {
        return this._cache;
    }
    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    protected newItem(data: any): string {
        const item = new this.type(data);
        return this.cache.addItem(item);
    }

    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    protected newItems(data: any[], select?: string): string[] {
        const items = data.map(x => new this.type(x));
        return this.cache.addItems(items);
    }

    protected fetchData(options: FetchDataOptions): Observable<any> {
        if (this._currentQuerySub) {
            return this._currentObservable;
        }
        this._status.next(LoadingStatus.Loading);

        const obs = options.getData();
        this._currentQuerySub = obs.subscribe((response) => {
            options.next(response);
            this._status.next(LoadingStatus.Ready);
            this.abortFetch();
        }, (error) => {
            // We need to clone the error otherwise it only logs the stacktrace
            // and not the actual error returned by the server which is not helpful
            log.error("Error in RxProxy", Object.assign({}, error));
            if (options.error) {
                options.error(error);
            }
            this._status.next(LoadingStatus.Error);
            this.abortFetch();
        });
        return obs;
    }

    protected queryInProgress(): boolean {
        return this._currentQuerySub !== null;
    }

    /**
     * Abort the current request if applicable
     */
    protected abortFetch() {
        if (this._currentQuerySub) {
            this._currentQuerySub.unsubscribe();
            this._currentQuerySub = null;
        }
    }

    /**
     * Call this method when loading new data(e.g. changing the id of the entity need a new entity to be loaded)
     */
    protected markLoadingNewData() {
        this._newDataStatus.next(LoadingStatus.Loading);
    }

    protected _clearDeleteSub() {
        if (this._deletedSub) {
            this._deletedSub.unsubscribe();
        }
    }
}
