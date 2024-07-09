import { CacheManagerBase } from "./cache-manager";

export class MemoryCacheManager extends CacheManagerBase {
    private cache: Map<string, unknown> = new Map();

    async getInternal<T>(
        key: string,
        defaultValue?: T
    ): Promise<T | undefined> {
        return this.cache.has(key) ? (this.cache.get(key) as T) : defaultValue;
    }

    async setInternal<T>(key: string, value: T): Promise<void> {
        this.cache.set(key, value);
    }

    async removeInternal(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clearInternal(): Promise<void> {
        this.cache.clear();
    }
}
