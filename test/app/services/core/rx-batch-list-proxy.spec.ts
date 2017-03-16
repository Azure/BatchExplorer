import {
    fakeAsync,
    tick,
} from "@angular/core/testing";
import { List, OrderedSet } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { BatchError, ServerError } from "app/models";
import { DataCache, RxBatchEntityProxy, RxBatchListProxy } from "app/services/core";
import { BatchClientServiceMock } from "test/utils/mocks";
import { FakeModel } from "./fake-model";
import { exists } from "app/utils";

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

class MockListProxy {
    public fetchNext: jasmine.Spy;
    public data: any[];
    public nextLink: any;
    public loadedFirst: any;

    private _options: any;

    constructor(options: any) {
        this.options = options;
        this.fetchNext = jasmine.createSpy("fetchNext").and.callFake(() => {
            if (!this.data) {
                return Promise.reject(<BatchError>{
                    statusCode: 409, code: "Bad",
                    message: { value: "Very bad stuff." },
                });
            }
            const pageData = this.data[this.page];
            this.nextLink++;
            if (this.nextLink === this.data.length) {
                this.nextLink = null;
            }
            this.loadedFirst = true;
            return Promise.resolve({ data: pageData });
        });
    }

    public set options(options) {
        this._options = options;
        if (options.filter === "filter1") {
            this.data = data;
        } else if (options.filter === "filter2") {
            this.data = updatedData;
        } else {
            this.data = null;
        }
        this.nextLink = 0;
        this.loadedFirst = false;
    }

    public hasMoreItems() {
        return !this.loadedFirst || this.nextLink < this.data.length;
    }

    public get page() {
        if (!this.loadedFirst) {
            return 0;
        } else if (this.nextLink) {
            return this.nextLink;
        } else {
            return this.data.length;
        }
    }
}

describe("RxBatchListProxy", () => {
    let proxy: RxBatchListProxy<{}, FakeModel>;
    let cache: DataCache<FakeModel>;
    let clientProxy: MockListProxy;
    let hasMore = true;
    let items: List<FakeModel>;
    let status: LoadingStatus;
    let error: ServerError;
    let batchClientServiceSpy;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        clientProxy = new MockListProxy({});
        batchClientServiceSpy = new BatchClientServiceMock(null);
        proxy = new RxBatchListProxy(FakeModel, batchClientServiceSpy, {
            cache: () => cache,
            proxyConstructor: (client, params, options) => {
                clientProxy.options = options;
                return clientProxy;
            },
            initialOptions: { filter: "filter1" },
        });
        proxy.hasMore.subscribe(x => hasMore = x);
        proxy.items.subscribe((x) => items = x);
        proxy.status.subscribe((x) => status = x);
        proxy.error.subscribe((x) => error = x);
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

        proxy.setOptions({ filter: "filter2" });
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
            const entityProxy = new RxBatchEntityProxy<any, FakeModel>(FakeModel, batchClientServiceSpy, {
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
            const entityProxy = new RxBatchEntityProxy<any, FakeModel>(FakeModel, batchClientServiceSpy, {
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
            const otherClientProxy = new MockListProxy({});
            let otherProxy = new RxBatchListProxy(FakeModel, batchClientServiceSpy, {
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
                expect(otherClientProxy.fetchNext).not.toHaveBeenCalled();

                expect(otherStatus).toBe(LoadingStatus.Ready);
                done();
            });
        });
    });

    describe("when first call returns an error", () => {
        let thrownError: ServerError;
        beforeEach((done) => {
            proxy.setOptions({ filter: "bad-filter" });
            proxy.fetchNext().subscribe(
                () => done(),
                (e) => { thrownError = e; done(); },
            );
        });

        it("should have the status set to Error", () => {
            expect(status).toBe(LoadingStatus.Error);
        });

        it("should have have an error", () => {
            expect(thrownError).not.toBeFalsy();
            expect(error).not.toBeFalsy();
            expect(error instanceof ServerError).toBe(true);
        });

        it("should have set hasMore item to false", () => {
            expect(hasMore).toBe(false);
        });

        it("should not fetch next", (done) => {
            proxy.fetchNext().subscribe(() => {
                // only the initial call
                expect(clientProxy.fetchNext).toHaveBeenCalledOnce();
                done();
            }, () => {
                expect(false).toBe(true, "Should not have returned a failure here");
            });
        });

        it("should fetch next if forcing new data", (done) => {
            proxy.refresh().subscribe({
                next: () => {
                    // only the initial call
                    expect(false).toBe(true, "Should not have returned a success here");
                },
                error: () => {
                    expect(clientProxy.fetchNext).toHaveBeenCalledTimes(2);
                    done();
                },
            });
        });

        it("should fix the error if changing filter to a valid one", (done) => {
            proxy.setOptions({ filter: "filter1" });
            proxy.fetchNext().subscribe({
                next: () => {
                    expect(clientProxy.fetchNext).toHaveBeenCalledTimes(2);
                    done();
                },
                error: () => {
                    // only the initial call
                    expect(false).toBe(true, "Should not have returned a failure here");
                },
            });
        });
    });
});
