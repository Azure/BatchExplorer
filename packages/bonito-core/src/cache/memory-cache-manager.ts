import { CacheManager } from "./cache-manager";

export class MemoryCacheManager implements CacheManager {
    private cache: Map<string, unknown> = new Map();

    async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        return this.cache.has(key) ? (this.cache.get(key) as T) : defaultValue;
    }

    async getOrAdd<T>(
        key: string,
        addValue: () => Promise<T>,
        options?: { bypassCache?: boolean }
    ): Promise<T> {
        if (!options?.bypassCache) {
            const cached = await this.get<T>(key);
            if (cached) {
                return cached;
            }
        }
        const value = await addValue();
        await this.set(key, value);
        return value;
    }

    async set<T>(key: string, value: T): Promise<void> {
        this.cache.set(key, value);
    }

    async remove(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
}
