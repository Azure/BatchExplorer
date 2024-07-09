import { initMockEnvironment } from "../../environment";
import { MemoryCacheManager } from "../memory-cache-manager";

const setup = (capacity = 100) => {
    initMockEnvironment();
    const cacheManager = new MemoryCacheManager(capacity);
    jest.spyOn(cacheManager.lruCache, "recordGet");
    jest.spyOn(cacheManager.lruCache, "recordSet");
    jest.spyOn(cacheManager.lruCache, "recordRemove");
    jest.spyOn(cacheManager.lruCache, "recordClear");
    return { cacheManager, lruCache: cacheManager.lruCache };
};

describe("Memory Cache Manager Test", () => {
    test("Memory cache manager works as expected", async () => {
        const { cacheManager, lruCache } = setup();
        const key = "test-key";
        const value = "test-value";

        await cacheManager.set(key, value);
        expect(lruCache.recordSet).toBeCalledWith(key);

        const result = await cacheManager.get(key, null);
        expect(result).toBe(value);
        expect(lruCache.recordGet).toBeCalledWith(key);

        await cacheManager.remove(key);
        const result2 = await cacheManager.get(key, null);
        expect(result2).toBeNull();
        expect(lruCache.recordRemove).toBeCalledWith(key);
    });

    test("clear should clear all cache", async () => {
        const { cacheManager, lruCache } = setup();
        const key = "test-key";
        const value = "test-value";

        await cacheManager.set(key, value);
        await cacheManager.clear();

        const result = await cacheManager.get(key);
        expect(result).toBeUndefined();
        expect(lruCache.recordClear).toBeCalledTimes(1);
    });

    test("getOrAdd should add value if not found", async () => {
        const { cacheManager } = setup();

        const key = "test-key";
        const value = "test-value";
        const addValue = jest.fn(() => Promise.resolve(value));
        const result = await cacheManager.getOrAdd(key, addValue);
        expect(result).toBe(value);
        expect(addValue).toBeCalledTimes(1);
    });

    test("getOrAdd should get value if found", async () => {
        const { cacheManager } = setup();

        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        const addValue = jest.fn(() => Promise.resolve("new-value"));
        const result = await cacheManager.getOrAdd(key, addValue, {});
        expect(result).toBe(value);
        expect(addValue).not.toBeCalled();
    });

    test("getOrAdd should bypass cache if specified", async () => {
        const { cacheManager } = setup();

        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        const addValue = jest.fn(() => Promise.resolve("new-value"));
        const result = await cacheManager.getOrAdd(key, addValue, {
            bypassCache: true,
        });
        expect(result).toBe("new-value");
        expect(addValue).toBeCalledTimes(1);
    });

    test("should remove value if excceed capacity", async () => {
        const { cacheManager } = setup(1);

        jest.spyOn(cacheManager, "remove");

        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        await cacheManager.set("key2", "value2");

        const result = await cacheManager.get(key);
        expect(result).toBeUndefined();

        const result2 = await cacheManager.get("key2");
        expect(result2).toBe("value2");

        expect(cacheManager.remove).toHaveBeenNthCalledWith(1, key);
        expect(cacheManager.lruCache.recordRemove).toHaveBeenNthCalledWith(
            1,
            key
        );
    });
});
