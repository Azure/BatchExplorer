import { ServerError } from "app/models";
import { BehaviorSubject, Observable } from "rxjs";

import { LoadingStatus } from "@bl-common/ui/loading/loading-status";
import { PollObservable } from "app/services/core/poll-service";
import { HttpCode } from "common/constants";
import { EntityGetter } from "./entity-getter";
import { GenericView, GenericViewConfig } from "./generic-view";

export interface EntityViewConfig<TEntity, TParams> extends GenericViewConfig<TEntity, TParams> {
    /**
     * If you want to have the entity proxy poll automatically for you every given milliseconds.
     * @default Disabled
     */
    poll?: number;

    getter: EntityGetter<TEntity, TParams>;
}

export class EntityView<TEntity, TParams> extends GenericView<TEntity, TParams, any> {
    /**
     * Contains the observable of the item you want to load.
     * Subscribe to this or use the async pipe on this attribute.
     */
    public item: Observable<TEntity>;

    private _itemKey = new BehaviorSubject<string>(null);
    private _pollTracker: PollObservable;
    private _getter: EntityGetter<TEntity, TParams>;

    constructor(config: EntityViewConfig<TEntity, TParams>) {
        super(config);
        this._getter = config.getter;

        this.item = this._itemKey.distinctUntilChanged().map((key) => {
            return this.cache.items.map((items) => {
                return items.get(key);
            });
        }).switch().distinctUntilChanged().takeUntil(this.isDisposed);

        if (config.poll) {
            this._pollTracker = this.startPoll(5000);
        }
    }

    /**
     * Fetch the current item.
     */
    public fetch(): Observable<any> {
        this._tryToLoadFromCache();

        return this.fetchData({
            getData: () => this._getter.fetch(this.params),
            next: (entity: TEntity) => {
                this._itemKey.next(entity[this.cache.uniqueField]);
            },
            error: (error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    this._itemKey.next(null);
                }
            },
        });
    }

    /**
     * @see RxProxyBase#dispose()
     */
    public dispose() {
        super.dispose();
        this._itemKey.complete();
        this.stopPoll();
    }

    public refresh(): Observable<any> {
        return this.fetch();
    }

    /**
     * Stop the automatically started poll if applicable
     */
    public stopPoll() {
        if (this._pollTracker) {
            this._pollTracker.destroy();
        }
    }

    /**
     * Abstract method implementation of what to do when the polling calls.
     */
    protected pollRefresh() {
        return this.refresh();
    }

    /**
     * Try to see if the entity is already in the cache if so load it immediatelly.
     */
    private _tryToLoadFromCache() {
        const key = this.params[this.cache.uniqueField];
        if (this.cache.has(key)) {
            this._itemKey.next(key);
            this._status.next(LoadingStatus.Ready);
        }
    }
}
