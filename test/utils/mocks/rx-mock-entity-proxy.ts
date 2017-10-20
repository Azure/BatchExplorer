// import { Type } from "@angular/core";
// import { Observable } from "rxjs";

// import { DataCache, RxEntityProxy } from "app/services/core";

// export interface RxMockEntityProxyConfig<TParams, TEntity> {
//     initialParams?: TParams;
//     cacheKey?: string;
//     item: TEntity;
// }

// /**
//  * Mock entity proxy where you pass in the entity you want to return
//  */
// export class RxMockEntityProxy<TParams, TEntity> extends RxEntityProxy<TParams, TEntity> {
//     private _item: TEntity;

//     constructor(type: Type<TEntity>, config: RxMockEntityProxyConfig<TParams, TEntity>) {
//         super(type, {
//             initialParams: config.initialParams,
//             cache: () => new DataCache<TEntity>(config.cacheKey || "id"),
//         });

//         this._item = config.item as TEntity;
//     }

//     protected getData(): Observable<TEntity> {
//         return Observable.of(this._processItem(this._item));
//     }

//     private _processItem(item: TEntity) {
//         if ((item as any).toJS) {
//             return (item as any).toJS();
//         } else {
//             return item;
//         }
//     }
// }
