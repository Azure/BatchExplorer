import { Map, Record } from "immutable";
import { TargetedDataCache } from "./targeted-data-cache";

/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match */
const FakeRecord = Record({
    id: null,
    state: null,
});

interface TargetParams {
    key1: string;
    key2: string;
}

describe("TargetedDataCache", () => {
    let cache: TargetedDataCache<TargetParams, any>;

    beforeEach(() => {
        cache = new TargetedDataCache({
            key: ({key1, key2}) => `${key1}/${key2}`,
        });
    });

    it("should give different cache for different params", () => {
        const cache1 = cache.getCache({ key1: "a", key2: "a1" });
        const cache2 = cache.getCache({ key1: "b", key2: "b1" });

        let items1: Map<string, any>;
        let items2: Map<string, any>;
        cache1.items.subscribe((x) => items1 = x);
        cache2.items.subscribe((x) => items2 = x);

        cache1.addItem(new FakeRecord({ id: "1", state: "running" }));
        expect(items1.size).toBe(1);
        expect(items2.size).toBe(0, "Should only have been added to the first cache");

        const cache3 = cache.getCache({ key1: "a", key2: "a1" });
        let items3: Map<string, any>;
        cache3.items.subscribe((x) => items3 = x);
        expect(items3.size).toBe(1, "Should retrieve the same cache as #1");
        expect(items3).toEqualImmutable(items1);

    });
});
