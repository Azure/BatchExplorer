import { getCacheManager } from "../cache-utils";
import { initMockEnvironment } from "../../environment";
import { LruCache } from "../lru-cache";

describe("Lru Cache Test", () => {
    beforeEach(() => {
        initMockEnvironment();
    });

    test("recordSet works as expected", async () => {
        const lruCache = new LruCache(getCacheManager(), 3);
        expect(lruCache.capacity).toBe(3);
        lruCache.recordSet("key1");
        lruCache.recordSet("key2");
        lruCache.recordSet("key3");

        const head = lruCache.getHead();
        expect(head?.key).toBe("key3");
        expect(head?.next?.key).toBe("key2");
        expect(head?.next?.next?.key).toBe("key1");

        lruCache.recordSet("key2");
        const head2 = lruCache.getHead();
        expect(head2?.key).toBe("key2");

        lruCache.recordSet("key4");
        const head3 = lruCache.getHead();
        expect(head3?.key).toBe("key4");
        expect(head3?.next?.key).toBe("key2");
        expect(head3?.next?.next?.key).toBe("key3");
        expect(lruCache.getSize()).toBe(3);
    });

    test("should call cacheManager's remove when capacity is exceeded", async () => {
        const lruCache = new LruCache(getCacheManager(), 1);
        jest.spyOn(lruCache, "recordRemove");
        const cacheManager = lruCache.cacheManager;
        jest.spyOn(cacheManager, "remove");

        const head = lruCache.getHead();
        expect(head).toBeNull();
        expect(lruCache.getSize()).toBe(0);

        lruCache.recordSet("key1");
        lruCache.recordSet("key2");
        expect(lruCache.getSize()).toBe(1);
        expect(cacheManager.remove).toHaveBeenNthCalledWith(1, "key1");
    });

    test("recordGet works as expected", async () => {
        const lruCache = new LruCache(getCacheManager(), 3);
        lruCache.recordSet("key1");
        lruCache.recordSet("key2");
        lruCache.recordSet("key3");

        lruCache.recordGet("key1");
        const head = lruCache.getHead();
        expect(head?.key).toBe("key1");
        expect(head?.next?.key).toBe("key3");
        expect(head?.next?.next?.key).toBe("key2");

        lruCache.recordGet("key3");
        const head2 = lruCache.getHead();
        expect(head2?.key).toBe("key3");

        lruCache.recordGet("key4");
        const head3 = lruCache.getHead();
        expect(head3?.key).toBe("key3");
    });

    test("recordRemove works as expected", async () => {
        const lruCache = new LruCache(getCacheManager(), 3);
        lruCache.recordSet("key1");
        lruCache.recordSet("key2");
        lruCache.recordSet("key3");

        lruCache.recordRemove("key2");
        const head = lruCache.getHead();
        expect(head?.key).toBe("key3");
        expect(head?.next?.key).toBe("key1");
        expect(lruCache.getSize()).toBe(2);
    });

    test("recordClear works as expected", async () => {
        const lruCache = new LruCache(getCacheManager(), 3);
        lruCache.recordSet("key1");
        lruCache.recordSet("key2");
        lruCache.recordSet("key3");
        expect(lruCache.getSize()).toBe(3);

        lruCache.recordClear();
        const head = lruCache.getHead();
        expect(head).toBeNull();
        expect(lruCache.getSize()).toBe(0);
    });

    test("should throw error if capacity is invalid", async () => {
        expect(() => new LruCache(getCacheManager(), 0)).toThrowError(
            "Invalid capacity: 0"
        );
    });
});
