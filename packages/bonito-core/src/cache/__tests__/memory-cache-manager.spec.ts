import { initMockEnvironment } from "../../environment";
import { CacheManager } from "../cache-manager";
import { getCacheManager } from "../cache-utils";

describe("Memory Cache Manager Test", () => {
    let cacheManager: CacheManager;

    beforeEach(() => {
        initMockEnvironment();
        cacheManager = getCacheManager();
    });

    test("Memory cache manager works as expected", async () => {
        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        const result = await cacheManager.get(key, null);
        expect(result).toBe(value);
        await cacheManager.remove(key);
        const result2 = await cacheManager.get(key, null);
        expect(result2).toBeNull();
    });

    test("clear should clear all cache", async () => {
        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        await cacheManager.clear();
        const result = await cacheManager.get(key);
        expect(result).toBeUndefined();
    });

    test("getOrAdd should add value if not found", async () => {
        const key = "test-key";
        const value = "test-value";
        const addValue = jest.fn(() => Promise.resolve(value));
        const result = await cacheManager.getOrAdd(key, addValue);
        expect(result).toBe(value);
        expect(addValue).toBeCalledTimes(1);
    });

    test("getOrAdd should get value if found", async () => {
        const key = "test-key";
        const value = "test-value";
        await cacheManager.set(key, value);
        const addValue = jest.fn(() => Promise.resolve("new-value"));
        const result = await cacheManager.getOrAdd(key, addValue, {});
        expect(result).toBe(value);
        expect(addValue).not.toBeCalled();
    });

    test("getOrAdd should bypass cache if specified", async () => {
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
});
