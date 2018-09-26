import { Record } from "@batch-flask/core/record";
import { ServerError } from "@batch-flask/core/server-error";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { ObjectUtils } from "@batch-flask/utils";
import { AsyncSubject, BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { DataCache } from "./data-cache";
import { PollObservable } from "./poll";
import { ProxyOptions } from "./proxy-options";

export interface FetchDataOptions {
    getData: () => Observable<any>;
    next: (response: any) => void;
    error?: (error: any) => void;
}

export interface GenericViewConfig<TEntity extends Record<any>, TParams> {
    /**
     *  Method that return the cache given the params.
     * This allow the use of targeted data cache which depends on some params.
     */
    cache: (params: TParams) => DataCache<TEntity>;
}

export abstract class GenericView<TEntity extends Record<any>, TParams, TOptions extends ProxyOptions> {
    /**
     * Status that keep track of any loading
     */
    public status: Observable<LoadingStatus>;

    /**
     * Contains the current error if any.
     */
    public error: Observable<ServerError>;

    /**
     * Push observable that send a notification if the item has been deleted.
     * Which means the item was previously loaded but returned a 404 on the last fetch.
     */
    public deleted: Observable<string>;

    /**
     * Status that is set to loading only when parameters change
     */
    public newDataStatus: Observable<LoadingStatus>;

    /**
     * Sets to   after calling dispose()
     */
    public isDisposed: AsyncSubject<boolean>;

    /**
     * Callback called when there is an error you can use that to ignore error
     * It should return a boolean set to false if you want to ignore the error
     */
    public onError: (error: ServerError) => boolean;

    public getCache: (params: TParams) => DataCache<TEntity>;

    protected _status = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    protected _newDataStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    protected _error = new BehaviorSubject<ServerError>(null);
    protected _cacheCleared = new Subject<void>();
    protected _params: TParams;
    protected _options: TOptions;

    private _pollObservable: PollObservable;
    private _currentQuerySub: Subscription = null;
    private _currentObservable: Observable<TEntity>;
    private _deletedSub: Subscription;
    private _deleted = new Subject<string>();
    private _cacheClearedSub: Subscription;
    private _cache: DataCache<TEntity>;

    constructor(config: GenericViewConfig<TEntity, TParams>) {
        this.getCache = config.cache;
        this.status = this._status.asObservable();
        this.newDataStatus = this._newDataStatus.asObservable();
        this.error = this._error.asObservable();
        this.isDisposed = new AsyncSubject();
        this._params = {} as any;
        this._onParamsChanged();
        this.status.subscribe((status) => {
            if (status === LoadingStatus.Loading) {
                this._error.next(null);
            }

            // If we were loading and the last request status change to ready or error
            if (this._newDataStatus.value === LoadingStatus.Loading && status !== LoadingStatus.Loading) {
                this._newDataStatus.next(status);
            }
        });

        this.deleted = this._deleted.asObservable();
        this.init();
    }

    public init() {
        // Nothing to do. Used in test for stub;
    }

    public set params(params: TParams) {
        this._params = params;
        this._onParamsChanged();
    }

    public get params() {
        return this._params;
    }

    public setOptions(options: TOptions, clearItems = true) {
        if (this._options instanceof ProxyOptions) {
            this._options = options;
        } else {
            this._options = new ProxyOptions(options) as any;
        }
        if (this._pollObservable) {
            this._pollObservable.updateKey(this._key());
        }
        if (this.queryInProgress()) {
            this.abortFetch();
        }
    }

    public patchOptions(options: TOptions, clearItems = true) {
        this.setOptions(Object.assign({}, this._options, options), clearItems);
    }

    /**
     * Start refreshing the data of this RxProxy every given interval
     * You can only have ONE poll per entity.
     * @param interval {number} Interval in milliseconds.
     */
    public startPoll(interval: number): PollObservable {
        if (this._pollObservable) {
            return this._pollObservable;
        }

        this._pollObservable = this.cache.pollService.startPoll(this._key(), interval, () => {
            return this.pollRefresh();
        });
        return this._pollObservable;
    }

    /**
     * This will release any reference used by the RxProxy.
     * You NEED to call this in ngOnDestroy
     * otherwise internal subscribe will never get cleared and the list porxy will not get GC
     */
    public dispose() {
        this.abortFetch();
        this.isDisposed.next(true);
        this.isDisposed.complete();
        this._clearDeleteSub();
        this._clearCachedClearedSub();
        this._deleted.complete();
        this._status.complete();
        this._error.complete();
        this._cacheCleared.complete();
    }

    protected set cache(cache: DataCache<TEntity>) {
        this._cache = cache;
        this._clearDeleteSub();
        this._clearCachedClearedSub();
        this._deletedSub = cache.deleted.subscribe((x) => {
            this._deleted.next(x);
        });

        this._cacheClearedSub = cache.cleared.subscribe((x) => {
            this._cacheCleared.next(x);
        });
    }

    protected get cache() {
        return this._cache;
    }

    /**
     * @returns the current options.
     */
    public get options() {
        return this._options;
    }

    protected fetchData(config: FetchDataOptions): Observable<any> {
        if (this._currentQuerySub) {
            return this._currentObservable;
        }
        this._status.next(LoadingStatus.Loading);

        const obs = this._currentObservable = config.getData();
        this._currentQuerySub = obs.subscribe({
            next: (response) => {
                this.abortFetch();
                config.next(response);
                this._status.next(LoadingStatus.Ready);
            }, error: (error: ServerError) => {
                this.abortFetch();
                if (!this.onError || this.onError(error)) {
                    this._status.next(LoadingStatus.Error);
                    this._error.next(error);
                    if (config.error) {
                        config.error(error);
                    }
                } else {
                    // error callback returned false so act like the error never happened
                    this._status.next(LoadingStatus.Ready);
                }

            },
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

    protected abstract pollRefresh(): Observable<any>;

    protected _clearDeleteSub() {
        if (this._deletedSub) {
            this._deletedSub.unsubscribe();
        }
    }

    protected _clearCachedClearedSub() {
        if (this._cacheClearedSub) {
            this._cacheClearedSub.unsubscribe();
        }
    }

    private _key() {
        const paramsKey = ObjectUtils.serialize(this._params);
        const optionsKey = this._options && ObjectUtils.serialize(this._options.original);
        return `${paramsKey}|${optionsKey}`;
    }

    private _onParamsChanged() {
        this.cache = this.getCache(this.params);
        if (this._pollObservable) {
            this._pollObservable.updateKey(this._key());
        }
        this.markLoadingNewData();
        this.abortFetch();
    }
}
