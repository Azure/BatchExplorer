import {
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { List } from "immutable";

import { DataCache, RxBatchListProxy } from "app/services/core";
import { FakeModel } from "./fake-model";

const data = [
    [
        { id: "1", state: "active", name: "Fake1" },
        { id: "2", state: "active", name: "Fake2" },
        { id: "3", state: "running", name: "Fake3" },
    ],
    [
        { id: "4", state: "running", name: "Fake4" },
        { id: "5", state: "completed", name: "Fake5" },
    ],
];

const updatedData = [[
    { id: "1", state: "running", name: "Fake1" },
    { id: "2", state: "running", name: "Fake2" },
    { id: "3", state: "completed", name: "Fake3" },
]];

class MockClientProxy {
    public fetchNext: jasmine.Spy;
    public data: any[];

    private _options: any;

    constructor(options: any) {
        this.options = options;

    }

    public set options(options) {
        this._options = options;
        if (options.filter === "filter1") {
            this.data = data;
        } else {
            this.data = updatedData;
        }
        this.fetchNext = jasmine.createSpy("").and.returnValues(...this.data.map(x => {
            return Promise.resolve({ data: x });
        }));
    }

    public clone() {
        const clone = new MockClientProxy(this._options);
        for (let i = 0; i < this.fetchNext.calls.count(); i++) {
            clone.fetchNext();
        }
        return clone;
    }

    public hasMoreItems() {
        return this.fetchNext.calls.count() < this.data.length;
    }
}

describe("RxBatchListProxy", () => {
    let proxy: RxBatchListProxy<{}, FakeModel>;
    let cache: DataCache<FakeModel>;
    let clientProxy: MockClientProxy;
    let hasMore = true;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        clientProxy = new MockClientProxy({});
        proxy = new RxBatchListProxy(FakeModel, {
            cache: () => cache,
            proxyConstructor: (params, options) => {
                clientProxy.options = options;
                return clientProxy;
            },
            initialOptions: { filter: "filter1" },
        });
        proxy.hasMore.subscribe(x => hasMore = x);
    });

    it("It retrieve the first batch of items", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
        expect(clientProxy.fetchNext).toHaveBeenCalledTimes(1);
        expect(hasMore).toBe(true);
    }));

    it("It fetch the next batch", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));

        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(data[0].concat(data[1]).map((x) => new FakeModel(x))));

        expect(clientProxy.fetchNext).toHaveBeenCalledTimes(2);
        expect(hasMore).toBe(false);
    }));

    it("should not clear the items when refresing with params true", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();
        proxy.refresh(true);
        expect(items.size).toBe(0);
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
    }));

    it("should not clear the items when refresing with params false", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();
        proxy.refresh(false);
        expect(items.size).not.toBe(0);
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
        items = null; // To make sure items get reassigned
        tick();
        expect(items).not.toBe(null);
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
    }));

    it("it should apply the options", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
        expect(clientProxy.fetchNext).toHaveBeenCalledTimes(1);

        proxy.setOptions({ filter: "fitler2" });
        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(updatedData[0].map((x) => new FakeModel(x))));
    }));

    it("Should remove item from the list when the cache call onItemDeleted", fakeAsync(() => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchNext();
        tick();

        cache.deleteItemByKey("2");
        const newList = [
            { id: "1", state: "active", name: "Fake1" },
            { id: "3", state: "running", name: "Fake3" },
        ];
        expect(items).toEqualImmutable(List(newList.map((x) => new FakeModel(x))));
    }));

    it("#fetchAll() should get all the items", (done) => {
        let items: List<FakeModel>;
        proxy.items.subscribe((x) => items = x);
        proxy.fetchAll().subscribe(() => {
            expect(items).toEqualImmutable(List(data[0].concat(data[1]).map((x) => new FakeModel(x))));
            done();
        });
    });
});
