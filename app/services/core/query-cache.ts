import { Set } from "immutable";
import * as moment from "moment";

import { Constants, ObjectUtils } from "app/utils";

const noQueryKey = "no-query";

export class CachedKeyList {
    public createdAt: Date;
    constructor(public keys: Set<string>, public data: any) {
        this.createdAt = new Date();
    }
}

/**
 * Cache the result of a list
 */
export class QueryCache {
    private _cache: { [key: string]: CachedKeyList } = {};

    public cacheQuery(filter: string, keys: Set<string>, data: any) {
        if (!filter) {
            filter = noQueryKey;
        }
        this._cache[filter] = new CachedKeyList(keys, data);
        this.cleanCache();
    }

    public getKeys(filter: string): CachedKeyList {
        if (!filter) {
            filter = noQueryKey;
        }
        return this._cache[filter];
    }

    public cleanCache() {
        const keys = Object.keys(this._cache);

        // Sort the key from oldest to youngest
        const sortedKeys = keys.filter(x => x !== noQueryKey).sort((a, b) => {
            return moment.utc(this._cache[a].createdAt).diff(moment.utc(this._cache[b].createdAt));
        });

        for (let i = 0; i < sortedKeys.length - Constants.caching.maxQuery; i++) {
            delete this._cache[sortedKeys[i]];
        }
    }

    public clearCache() {
        this._cache = {};
    }

    /**
     * Called by the cache when an item was deleted
     */
    public deleteItemKey(key: string) {
        for (let cachedList of ObjectUtils.values(this._cache)) {
            cachedList.keys = Set<string>(cachedList.keys.filter(x => x !== key));
        }
    }
}
