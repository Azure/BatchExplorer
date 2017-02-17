import {
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { List, OrderedSet } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy } from "app/services/core";
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

let mockProxyIdCounter = 0;

class MockClientProxy {
    public fetchNext: jasmine.Spy;
    public data: any[];
    public page = 0;
    public id: number;
    private _options: any;

    constructor(options: any) {
        this.id = mockProxyIdCounter++;
        this.options = options;
        this.fetchNext = jasmine.createSpy("fetchNext").and.callFake(() => {
            return Promise.resolve({ data: this.data[this.page++] });
        });
    }

    public set options(options) {
        this._options = options;
        if (options.filter === "filter1") {
            this.data = data;
        } else {
            this.data = updatedData;
        }
        this.page = 0;
    }

    public clone() {
        const clone = new MockClientProxy(this._options);
        clone.page = this.page;
        clone.id = this.id;
        return clone;
    }

    public hasMoreItems() {
        return this.page < this.data.length;
    }
}

describe("RxBatchListProxy", () => {
    let proxy: RxBatchListProxy<{}, FakeModel>;
    let cache: DataCache<FakeModel>;
    let clientProxy: MockClientProxy;
    let hasMore = true;
    let items: List<FakeModel>;
    let status: LoadingStatus;

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
        proxy.items.subscribe((x) => items = x);
        proxy.status.subscribe((x) => status = x);
    });

    it("It retrieve the first batch of items", fakeAsync(() => {
        proxy.fetchNext();
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
        expect(clientProxy.fetchNext).toHaveBeenCalledTimes(1);
        expect(hasMore).toBe(true);
        expect(status).toBe(LoadingStatus.Ready);
    }));

    it("It fetch the next batch", fakeAsync(() => {
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
        proxy.fetchNext();
        tick();
        proxy.refresh(true);
        expect(items.size).toBe(0);
        tick();
        expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
    }));

    it("should not clear the items when refresing with params false", fakeAsync(() => {
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
        proxy.fetchAll().subscribe(() => {
            expect(items).toEqualImmutable(List(data[0].concat(data[1]).map((x) => new FakeModel(x))));
            done();
        });
    });

    describe("#loadNewItem()", () => {
        beforeEach((done) => {
            proxy.fetchNext().subscribe(() => done());
        });

        it("should NOT add the item if already present and update exiting one", (done) => {
            const entityProxy = new RxBatchEntityProxy<any, FakeModel>(FakeModel, {
                cache: () => cache,
                getFn: () => Promise.resolve({ data: { id: "2", state: "running", name: "Fake2" } }),
            });
            const expected = [
                { id: "1", state: "active", name: "Fake1" },
                { id: "2", state: "running", name: "Fake2" },
                { id: "3", state: "running", name: "Fake3" },
            ];

            proxy.loadNewItem(entityProxy as any).subscribe(() => {
                expect(items).toEqualImmutable(List(expected.map((x) => new FakeModel(x))));
                done();
            });
        });

        it("should add the item if NOT already present", (done) => {
            const entityProxy = new RxBatchEntityProxy<any, FakeModel>(FakeModel, {
                cache: () => cache,
                getFn: () => Promise.resolve({ data: { id: "4", state: "running", name: "Fake4" } }),
            });

            const expected = [
                { id: "4", state: "running", name: "Fake4" },
            ].concat(data[0]);

            proxy.loadNewItem(entityProxy as any).subscribe(() => {
                expect(items).toEqualImmutable(List(expected.map((x) => new FakeModel(x))));
                done();
            });
        });
    });

    describe("when there is keys in the cachedKeys", () => {
        beforeEach((done) => {
            // This should set the query cache
            proxy.fetchNext().subscribe(() => done());
        });

        it("should have set the query cache", () => {
            let queryCache = cache.queryCache.getKeys("filter1");
            expect(queryCache).not.toBeFalsy();
            expect(queryCache.keys).toEqualImmutable(OrderedSet(["1", "2", "3"]));
        });

        it("a new proxy with the same query should use the same keys and not load anything", (done) => {
            const otherClientProxy = new MockClientProxy({});
            let otherProxy = new RxBatchListProxy(FakeModel, {
                cache: () => cache,
                proxyConstructor: (params, options) => {
                    otherClientProxy.options = options;
                    return otherClientProxy;
                },
                initialOptions: { filter: "filter1" },
            });
            let otherStatus: LoadingStatus;
            otherProxy.status.subscribe((x) => otherStatus = x);
            otherProxy.fetchNext().subscribe(() => {
                expect(items).toEqualImmutable(List(data[0].map((x) => new FakeModel(x))));
                const currentClientProxy: MockClientProxy = (otherProxy as any)._clientProxy;
                expect(currentClientProxy.id).toEqual(clientProxy.id,
                    "Should be a clone of the client proxy used the first time");
                expect(currentClientProxy.fetchNext).not.toHaveBeenCalled();
                expect(otherClientProxy.fetchNext).not.toHaveBeenCalled();

                expect(otherStatus).toBe(LoadingStatus.Ready);
                done();
            });
        });
    });
});
