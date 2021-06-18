import { Type } from "@angular/core";
import { BasicListGetter, DataCache, ListView, Record } from "@batch-flask/core";
import { of } from "rxjs";

export interface MockListViewConfig<TEntity  extends Record<any>, TParams> {
    initialParams?: TParams;
    items: TEntity[] | ((params: TParams) => TEntity[]);

    /**
     * Name of the key for the cache
     * @default id
     */
    cacheKey?: string;
}

/**
 * Mock list proxy where you pass the list of data to return
 */
export class MockListView<TEntity extends Record<any>, TParams> extends ListView<TEntity, TParams> {
    private _items: (params: TParams) => TEntity[];

    constructor(type: Type<TEntity>, config: MockListViewConfig<TEntity, TParams>) {
        const cache = new DataCache<TEntity>(config.cacheKey || "id");
        super({
            cache: () => cache,
            getter: new BasicListGetter(type, {
                cache: () => cache,
                supplyData: (params) => {
                    return of({
                        data: this._getItems(params),
                    });
                },
            }),
        });
        if (config.items instanceof Function) {
            this._items = config.items;
        } else {
            this._items = () => config.items as TEntity[];
        }
    }

    public updateItems(items: TEntity[]) {
        this._items = () => items as TEntity[];
    }

    private _getItems(params) {
        return this._items(params).map((item) => {
            if ((item as any).toJS) {
                return (item as any).toJS();
            } else {
                return item;
            }
        });
    }
}
