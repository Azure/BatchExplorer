import { Type } from "@angular/core";
import { of } from "rxjs";

import { BasicEntityGetter, DataCache, EntityView } from "@batch-flask/core";

export interface MockEntityViewConfig<TEntity> {
    cacheKey?: string;
    item: TEntity;
}

/**
 * Mock entity proxy where you pass in the entity you want to return
 */
export class MockEntityView<TEntity, TParams> extends EntityView<TEntity, TParams> {
    private _item: TEntity;

    constructor(type: Type<TEntity>, config: MockEntityViewConfig<TEntity>) {
        const cache = new DataCache<TEntity>(config.cacheKey || "id");
        super({
            cache: () => cache,
            getter: new BasicEntityGetter(type, {
                cache: () => cache,
                supplyData: () => of(this._item),
            }),
        });

        this._item = this._processItem(config.item as TEntity);
    }

    private _processItem(item: TEntity) {
        if ((item as any).toJS) {
            return (item as any).toJS();
        } else {
            return item;
        }
    }
}
