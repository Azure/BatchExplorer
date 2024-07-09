import { LruCache } from "./lru-cache";

export interface getOrAddOptions {
    /**
     * If true, the cache will be bypassed, and the value will be fetched from the source
     */
    bypassCache?: boolean;
}

export interface CacheManager {
    /**
     * Get a value from the cache
     * @param key The key to look up
     * @param defaultValue The value to return if the key is not found
     */
    get<T>(key: string, defaultValue?: T): Promise<T | undefined>;

    /**
     * Get a value from the cache, or add it if it is not found
     * @param key The key to look up
     * @param addValue The value to add if the key is not found
     */
    getOrAdd<T>(
        key: string,
        addValue: () => Promise<T>,
        options?: getOrAddOptions
    ): Promise<T>;

    /**
     * Set a value in the cache
     * @param key The key to set
     * @param value The value to set
     */
    set<T>(key: string, value: T): Promise<void>;

    /**
     * Remove a value from the cache
     * @param key The key to remove
     */
    remove(key: string): Promise<void>;

    /**
     * Clear all cache
     */
    clear(): Promise<void>;
}

export abstract class CacheManagerBase implements CacheManager {
    lruCache: LruCache;

    constructor(public capacity: number = 100) {
        this.lruCache = new LruCache(this, capacity);
    }

    async getOrAdd<T>(
        key: string,
        addValue: () => Promise<T>,
        options?: getOrAddOptions
    ): Promise<T> {
        const bypassCache = options?.bypassCache ?? false;
        if (!bypassCache) {
            const cached = await this.get<T>(key);
            if (cached) {
                return cached;
            }
        }
        const value = await addValue();
        await this.set(key, value);
        return value;
    }

    async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        this.lruCache.recordGet(key);
        return this.getInternal<T>(key, defaultValue);
    }
    abstract getInternal<T>(
        key: string,
        defaultValue?: T
    ): Promise<T | undefined>;

    async set<T>(key: string, value: T): Promise<void> {
        this.lruCache.recordSet(key);
        return this.setInternal(key, value);
    }
    abstract setInternal<T>(key: string, value: T): Promise<void>;

    async remove(key: string): Promise<void> {
        this.lruCache.recordRemove(key);
        return this.removeInternal(key);
    }
    abstract removeInternal(key: string): Promise<void>;

    async clear(): Promise<void> {
        this.lruCache.recordClear();
        return this.clearInternal();
    }
    abstract clearInternal(): Promise<void>;
}
