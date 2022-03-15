import { OrderedMap } from "../ordered-map";

describe("OrderedMap", () => {
    test("Can initialize a new map", () => {
        const map = createStringMap();

        expect(map.size).toBe(3);
        expect(map.internalValueMap.size).toBe(3);
        expect(map.internalKeys.length).toBe(3);
    });

    test("Can clear", () => {
        const map = createStringMap();
        map.clear();

        expect(map.size).toBe(0);
        expect(map.internalValueMap.size).toBe(0);
        expect(map.internalKeys.length).toBe(0);
    });

    test("Can delete by key", () => {
        const map = createStringMap();
        map.delete("two");

        expect(map.size).toBe(2);
        expect(map.internalValueMap.size).toBe(2);
        expect(map.internalKeys).toEqual(["one", "three"]);
    });

    test("Can iterate in order using forEach", () => {
        const map = createStringMap();

        // Insert a value in the middle so we can be sure we're iterating in
        // the correct order rather than simply the order in which the map
        // was created
        map.insertAfter("two", "inserted", "Inserted Value");

        const keys: string[] = [];
        const values: string[] = [];

        map.forEach((value, key) => {
            keys.push(key);
            values.push(value);
        });

        expect(keys).toEqual(["one", "two", "inserted", "three"]);
        expect(values).toEqual([
            "Value One",
            "Value Two",
            "Inserted Value",
            "Value Three",
        ]);
    });

    test("Can get a value by key", () => {
        const map = createStringMap();
        expect(map.get("one")).toEqual("Value One");
        expect(map.get("doesntexist")).toBeUndefined();
    });

    test("Can check if a key exists in the map", () => {
        const map = createStringMap();
        expect(map.has("one")).toBe(true);
        expect(map.has("doesntexist")).toBe(false);
    });

    test("Can set a key/value pair", () => {
        const map = createStringMap();

        // Overwrite existing
        map.set("one", "Updated One");

        // New (added to the end)
        map.set("four", "Value Four");

        expect(Array.from(map.keys())).toEqual(["one", "two", "three", "four"]);
        expect(Array.from(map.values())).toEqual([
            "Updated One",
            "Value Two",
            "Value Three",
            "Value Four",
        ]);
    });

    test("Can insert at a given index", () => {
        const map = createStringMap();

        // Add at the beginning, the middle, and the end
        map.insertAtIndex(0, "zero", "Value Zero");
        map.insertAtIndex(2, "onepointfive", "One and a Half");
        map.insertAtIndex(5, "four", "Value Four");

        expect(Array.from(map.keys())).toEqual([
            "zero",
            "one",
            "onepointfive",
            "two",
            "three",
            "four",
        ]);

        expect(() => map.insertAtIndex(999, "fail", "fail")).toThrowError();
    });

    test("Can insert after a given value", () => {
        const map = createStringMap();

        map.insertAfter("one", "onepointfive", "One and a Half");
        map.insertAfter("three", "four", "Value Four");

        expect(Array.from(map.keys())).toEqual([
            "one",
            "onepointfive",
            "two",
            "three",
            "four",
        ]);

        expect(() =>
            map.insertAfter("doesntexist", "fail", "fail")
        ).toThrowError();
    });

    test("Can insert before a given value", () => {
        const map = createStringMap();

        map.insertBefore("one", "zero", "Value Zero");
        map.insertBefore("three", "twopointfive", "Two and a Half");

        expect(Array.from(map.keys())).toEqual([
            "zero",
            "one",
            "two",
            "twopointfive",
            "three",
        ]);

        expect(() =>
            map.insertBefore("doesntexist", "fail", "fail")
        ).toThrowError();
    });

    test("Can iterate over entries", () => {
        const map = createStringMap();
        expect(Array.from(map.entries())).toEqual([
            ["one", "Value One"],
            ["two", "Value Two"],
            ["three", "Value Three"],
        ]);
    });

    test("Can iterate over keys", () => {
        const map = createStringMap();
        expect(Array.from(map.keys())).toEqual(["one", "two", "three"]);
    });

    test("Can iterate over values", () => {
        const map = createStringMap();
        expect(Array.from(map.values())).toEqual([
            "Value One",
            "Value Two",
            "Value Three",
        ]);
    });

    test("Can iterate using the map itself", () => {
        const map = createStringMap();
        expect(Array.from(map)).toEqual([
            ["one", "Value One"],
            ["two", "Value Two"],
            ["three", "Value Three"],
        ]);
    });
});

function createStringMap(): InspectableOrderedMap<string, string> {
    const map: InspectableOrderedMap<string, string> =
        new InspectableOrderedMap();
    map.set("one", "Value One");
    map.set("two", "Value Two");
    map.set("three", "Value Three");
    return map;
}

/**
 * Exposes some internals for testing purposes only
 */
class InspectableOrderedMap<K, V> extends OrderedMap<K, V> {
    get internalKeys(): K[] {
        return this._keys;
    }

    get internalValueMap(): Map<K, V> {
        return this._valueMap;
    }
}
