import { Type } from "@angular/core";
import { BasicEntityGetter, DataCache, EntityView } from "@batch-flask/core";
import { Record } from "@batch-flask/core/record";
import { of } from "rxjs";

export interface MockEntityViewConfig<TEntity, TParams> {
    cacheKey?: string;
    item: TEntity | ((params: TParams) => TEntity);
}

/**
 * Mock entity proxy where you pass in the entity you want to return
 */
export class MockEntityView<TEntity extends Record<any>, TParams> extends EntityView<TEntity, TParams> {
    private _item: ((params: TParams) => TEntity);

    constructor(type: Type<TEntity>, config: MockEntityViewConfig<TEntity, TParams>) {
        const cache = new DataCache<TEntity>(config.cacheKey || "id");
        super({
            cache: () => cache,
            getter: new BasicEntityGetter(type, {
                cache: () => cache,
                supplyData: () => of(this._getItem()),
            }),
        });

        if (config.item instanceof Function) {
            this._item = config.item;
        } else {
            this._item = () => config.item as TEntity;
        }
    }

    private _getItem() {
        const item = this._item(this.params);
        if ((item as any).toJS) {
            return (item as any).toJS();
        } else {
            return item;
        }
    }
}
