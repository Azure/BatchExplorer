import { OrderedSet } from "immutable";
import * as moment from "moment";

import { ObjectUtils } from "@batch-flask/utils";
import { ContinuationToken } from "../list-options";

const noQueryKey = "no-query";

const maxQuery =  1;

export class CachedKeyList {
    public createdAt: Date;
    constructor(public keys: OrderedSet<string>, public token: ContinuationToken) {
        this.createdAt = new Date();
    }
}

/**
 * Cache the result of a list
 */
export class QueryCache {
    private _cache: { [key: string]: CachedKeyList } = {};

    public cacheQuery(keys: OrderedSet<string>, token: ContinuationToken) {
        const key = this._cacheKey(token.options.filter && token.options.filter.toOData(), token.options.select);
        this._cache[key] = new CachedKeyList(keys, token);
        this.cleanCache();
    }

    public addKeyToQuery(filter: string, key: string) {
        if (!filter) {
            filter = noQueryKey;
        }
        const query = this._cache[filter];
        if (!query) {
            return;
        }
        query.keys = query.keys.add(key);
    }

    public getKeys(filter: string, select?: string): CachedKeyList {
        const key = this._cacheKey(filter, select);
        return this._cache[key];
    }

    public cleanCache() {
        const keys = Object.keys(this._cache);

        // Sort the key from oldest to youngest
        const sortedKeys = keys.filter(x => x !== this._cacheKey(null, null)).sort((a, b) => {
            return moment.utc(this._cache[a].createdAt).diff(moment.utc(this._cache[b].createdAt));
        });

        for (let i = 0; i < sortedKeys.length - maxQuery; i++) {
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
        for (const cachedList of ObjectUtils.values(this._cache)) {
            cachedList.keys = OrderedSet<string>(cachedList.keys.filter(x => x !== key));
        }
    }

    private _cacheKey(filter: string, select: string) {
        return `${filter || null}|${select || null}`;
    }
}
