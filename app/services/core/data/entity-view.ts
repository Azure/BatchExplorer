import { ServerError } from "app/models";
import { PollObservable } from "app/services/core";
import { HttpCode } from "app/utils/constants";
import { BehaviorSubject, Observable } from "rxjs";
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
        const obs = this.fetchData(() => this._getter.fetch(this.params));
        obs.subscribe({
            next: (entity: TEntity) => {
                this._itemKey.next(entity[this.cache.uniqueField]);
            },
            error: (error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    this._itemKey.next(null);
                }
            },
        });
        return obs;
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
}
