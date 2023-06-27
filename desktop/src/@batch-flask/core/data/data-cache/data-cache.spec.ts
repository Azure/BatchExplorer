import { Map, Record } from "immutable";
import { DataCache } from "./data-cache";

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
const FakeRecord = Record({
    id: null,
    state: null,
    location: null,
});

const item1 = new FakeRecord({ id: "1", state: "active", location: "westus" });
const item2 = new FakeRecord({ id: "2", state: "waiting", location: "westus" });
const item3 = new FakeRecord({ id: "3", state: "queued", location: "eastus" });
const item4 = new FakeRecord({ id: "4", state: "completed", location: "eastus" });

const item2Update = new FakeRecord({ id: "2", state: "running", location: "westus" });
const item3PartialUpdate = new FakeRecord({ id: "3", state: "running" });
const newItem3 = new FakeRecord({ id: "3", state: "running", location: "eastus" });

describe("DataCache", () => {
    let cache: DataCache<any>;
    let items: Map<string, any>;
    let sub;
    beforeEach(() => {
        cache = new DataCache<any>();
        sub = cache.items.subscribe(x => items = x as any);
        cache.addItems([item1, item2, item3]);
    });

    afterEach(() => {
        sub.unsubscribe();
    });

    it("Should add items correcly", () => {
        expect(items.size).toEqual(3);
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toEqual(item2);
        expect(items.get("3")).toEqual(item3);
    });

    it("Should add 1 item correcly", () => {
        cache.addItem(item4);
        expect(items.size).toEqual(4);
        expect(items.get("3")).toEqual(item3);
        expect(items.get("4")).toEqual(item4);
    });

    it("Should update item fully", () => {

        expect(items.size).toEqual(3);

        cache.addItem(item2Update);
        expect(items.size).toEqual(3, "Should still have only 2 items");
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toEqual(item2Update);
        expect(items.get("3")).toEqual(item3);
    });

    it("Should update item partial", () => {
        cache.addItem(item1);
        cache.addItem(item2);
        expect(items.size).toEqual(3);

        cache.addItem(item3PartialUpdate, "id,state");
        expect(items.size).toEqual(3, "Should still have only 2 items");
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toEqual(item2);
        expect(items.get("3")).toEqualImmutable(newItem3);
    });

    it("Additems should update existing item and add new ones", () => {
        cache.addItems([item2Update, item4]);
        expect(items.size).toEqual(4, "Should now have 4 items");
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toEqual(item2Update);
        expect(items.get("3")).toEqual(item3);
        expect(items.get("4")).toEqual(item4);
    });

    it("Additems should do partial updates", () => {
        cache.addItems([item3PartialUpdate, item4], "id,state");
        expect(items.size).toEqual(4, "Should now have 4 items");
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toEqual(item2);
        expect(items.get("3")).toEqualImmutable(newItem3);
    });

    it("Should delete an item correcly and send notification", () => {
        const onItemDeletedSpy = jasmine.createSpy("onItemDeleted");
        cache.deleted.subscribe(onItemDeletedSpy);

        cache.deleteItem(item2);

        expect(items.size).toEqual(2, "There should be 1 less item");
        expect(items.get("1")).toEqual(item1);
        expect(items.get("2")).toBe(undefined);
        expect(items.get("3")).toEqualImmutable(item3);

        expect(onItemDeletedSpy).toHaveBeenCalledTimes(1);
        expect(onItemDeletedSpy).toHaveBeenCalledWith("2");
    });
});
