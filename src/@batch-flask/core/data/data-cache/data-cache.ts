import { Record } from "@batch-flask/core/record";
import { ObjectUtils, SecureUtils } from "@batch-flask/utils";
import { Map } from "immutable";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { PollService } from "../poll";
import { QueryCache } from "../query-cache";

export class DataCacheTracker {

    public static registerCache(cache: DataCache<any>) {
        this._caches[cache.id] = cache;
    }

    public static unregisterCache(cache: DataCache<any>) {
        delete this._caches[cache.id];
    }

    public static clearAllCaches(...except: Array<DataCache<any>>) {
        const excludeIds = except.map(x => x.id);
        for (const cache of ObjectUtils.values(this._caches)) {
            if (excludeIds.indexOf(cache.id) === -1) {
                cache.clear();
            }
        }
    }

    public static disposeAll() {
        for (const cache of ObjectUtils.values(this._caches)) {
            cache.clear();
            this.unregisterCache(cache);
        }
    }

    private static _caches: { [key: string]: DataCache<any> } = {};
}

/**
 * Cache storage for entity and list of items.
 * Supports partial updates(OData select)
 */
export class DataCache<T extends Record<any>> {
    /**
     * Datacache id. Every datacache is assigned a unique guid
     */
    public id: string;
    public items: Observable<Map<string, T>>;
    public deleted: Observable<string>;

    /**
     * Notification when the cache is being cleared
     */
    public cleared: Observable<void>;

    public queryCache = new QueryCache();
    public pollService = new PollService();

    private _items = new BehaviorSubject<Map<string, T>>(Map<string, T>({}));
    private _deleted = new Subject<string>();
    private _cleared = new Subject<void>();

    /**
     * @param _uniqueField Each record should have a unqiue field. This is used to update the cache.
     */
    constructor(public readonly uniqueField = "id") {
        this.id = SecureUtils.uuid();
        this.items = this._items.asObservable();
        this.deleted = this._deleted.asObservable();
        this.cleared = this._cleared.asObservable();
        DataCacheTracker.registerCache(this);
    }

    public clear() {
        this.queryCache.clearCache();
        this._cleared.next();
        this._items.next(Map<string, T>({}));
    }

    public dispose() {
        this.clear();
        DataCacheTracker.unregisterCache(this);
    }

    /**
     * Add a new item to the cache.
     * If this item is already there(Same unqiue key) it will just update
     * @param item Item to be added to the cache
     * @param select OData select if applicable.
     *        If specify only the attributtes in that filter will be modified in the cache
     * @return the unique key for the item you added
     */
    public addItem(item: T, select?: string): string {
        const key = this.getItemKey(item);
        const computedItem = this._computeNewItem(item, key, select);
        const existingItem = this._items.value.get(key);

        // Only update the cache if the item is different
        if (!existingItem || !existingItem.equals(computedItem)) {
            const newItems = this._items.value.merge({ [key]: computedItem });
            this._items.next(newItems);
        }

        return key;
    }

    /**
     * @see addItem
     * Add multiple items as addItem do.
     * @return the list of unique keys
     */
    public addItems(items: T[], select?: string): string[] {
        const newItems: { [key: string]: T } = {};
        const keys = [];
        for (const item of items) {
            const key = this.getItemKey(item);
            keys.push(key);
            newItems[key] = this._computeNewItem(item, key, select);
        }

        this._items.next(this._items.value.merge(newItems));
        return keys;
    }

    /**
     * Return true if the cache contains the item for the given key
     * @param key Unique key of the item
     */
    public has(key: string): boolean {
        return this._items.value.has(key);
    }

    /**
     * Return the item in the data cache at the time of access
     * @param key Unique key of the item
     */
    public get(key: string): T {
        return this._items.value.get(key);
    }

    /**
     * Delete the given item from the cache if found.
     * @param key: Unique key of the item to delte
     * @return Boolean if the item was present in the cache
     */
    public deleteItem(item: T): boolean {
        return this.deleteItemByKey(this.getItemKey(item));
    }

    /**
     * Delete the item saved in the cache by the given key
     * @param key: Unique key of the item to delte
     * @return Boolean if the item was present in the cache
     */
    public deleteItemByKey(key: string): boolean {
        this.queryCache.deleteItemKey(key);
        if (!this.has(key)) {
            return false;
        }
        this._deleted.next(key);
        this._items.next(this._items.value.delete(key));
        return true;
    }

    public getItemKey(item: T) {
        return item[this.uniqueField].toString();
    }

    private _getAttributesList(select: string): string[] {
        return select.split(",");
    }

    private _computeNewItem(item: T, key: string, select?: string): T {
        if (!select) { return item; }
        const oldItem = this._items.value.get(key);
        if (!oldItem) { return item; }
        const attributes = ObjectUtils.slice((item as any).toJS(), this._getAttributesList(select));
        return (oldItem as any).merge(attributes);
    }
}
