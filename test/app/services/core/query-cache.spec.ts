import { QueryCache } from "app/services/core";
import { OrderedSet } from "immutable";

class FakeClientProxy {
    public value = "original";

    public clone() {
        return new FakeClientProxy();
    }
}

describe("QueryCache", () => {
    let cache: QueryCache;
    let clientProxy: FakeClientProxy;

    beforeEach(() => {
        clientProxy = new FakeClientProxy();
        cache = new QueryCache();
        cache.cacheQuery(undefined, OrderedSet(["a", "b", "c"]), clientProxy);
        cache.cacheQuery("id eq a", OrderedSet(["a"]), clientProxy);

    });

    it("Should get the added queries", () => {
        const cacheList = cache.getKeys("id eq a");

        expect(cacheList).not.toBe(clientProxy as any);
        expect(cacheList.keys).toEqualImmutable(OrderedSet(["a"]));
    });

    it("Caching a new query should remove the oldest execluding the no-query", () => {
        cache.cacheQuery("id eq b", OrderedSet(["b"]), clientProxy);

        expect(cache.getKeys(undefined)).not.toBe(null, "Should not have removed the undefined query");
        expect(cache.getKeys("id eq b")).not.toBe(null, "The new query should have been added");
        expect(cache.getKeys("id eq a")).not.toBe(null, "The oldest query should have been added");
    });

    it("Clear cache should remove everything", () => {
        cache.clearCache();
        expect(cache.getKeys(undefined)).not.toBe(null);
        expect(cache.getKeys("id eq a")).not.toBe(null);
    });

    it("delete item from query cache should remove from every query", () => {
        cache.deleteItemKey("a");
        expect(cache.getKeys(undefined).keys).toEqualImmutable(OrderedSet(["b", "c"]));
        expect(cache.getKeys("id eq a").keys).toEqualImmutable(OrderedSet([]));
    });
});
