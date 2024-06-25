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
    get<T>(key: string, defaultValue?: T): Promise<T>;

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
