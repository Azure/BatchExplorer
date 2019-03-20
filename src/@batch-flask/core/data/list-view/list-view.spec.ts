import { BasicEntityGetter, BasicListGetter, DataCache, FilterBuilder, ListView, ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { List, OrderedSet } from "immutable";
import { from, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { FakeModel } from "../test/fake-model";

const fake1 = { id: "1", parentId: "parent-1", state: "active", name: "Fake1" };
const fake2 = { id: "2", parentId: "parent-1", state: "active", name: "Fake2" };
const fake3 = { id: "3", parentId: "parent-1", state: "running", name: "Fake3" };
const fake4 = { id: "4", parentId: "parent-1", state: "running", name: "Fake4" };
const fake5 = { id: "5", parentId: "parent-1", state: "completed", name: "Fake5" };

const firstPage = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "2", state: "active", name: "Fake2" },
    { id: "3", state: "running", name: "Fake3" },
];

const secondPage = [
    { id: "4", state: "running", name: "Fake4" },
    { id: "5", state: "completed", name: "Fake5" },
];

const filteredData = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "3", state: "running", name: "Fake3" },
    { id: "4", state: "running", name: "Fake4" },
];

const filters = {
    filter1: FilterBuilder.prop("id").eq("filter1"),
    filter2: FilterBuilder.prop("id").eq("filter2"),
    badFilter: FilterBuilder.prop("id").eq("bad-filter"),
};

function getData(params, options, nextLink) {
    if (options && options.filter === filters.filter2) {
        return {
            data: filteredData,
        };
    } else if (nextLink) {
        return {
            data: secondPage,
        };
    } else {
        return {
            data: firstPage,
            nextLink: "#page2",
        };
    }
}

describe("ListView", () => {
    let getter: BasicListGetter<FakeModel, {}>;
    let cache: DataCache<FakeModel>;
    let dataSpy: jasmine.Spy;
    let view: ListView<FakeModel, {}>;

    let items: List<FakeModel>;
    let hasMore: boolean;
    let status: LoadingStatus;
    let error: ServerError;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        dataSpy = jasmine.createSpy("supplyDataSpy").and.callFake((params, options, nextLink) => {
            if (options && options.filter === filters.badFilter) {
                return from(Promise.reject(new ServerError({
                    status: 409,
                    message: "Conflict on the resource",
                    code: "Conflict",
                })));
            } else {
                return from(Promise.resolve(getData(params, options, nextLink)));
            }
        });

        getter = new BasicListGetter(FakeModel, {
            cache: () => cache,
            supplyData: dataSpy,
        });

        view = new ListView({
            cache: () => cache,
            getter: getter,
        });
        view.params = {
            parentId: "parent-1",
        };
        view.items.subscribe(x => items = x);
        view.hasMore.subscribe(x => hasMore = x);
        view.status.subscribe(x => status = x);
        view.error.subscribe(x => error = x);
    });

    afterEach(() => {
        view.dispose();
    });

    it("should have no items and ready to load more by default", () => {
        expect(hasMore).toBe(true);
        expect(items.toJS()).toEqual([]);
    });

    it("It retrieve the first batch of items", (done) => {
        view.fetchNext().subscribe(() => {
            expect(items.toJS()).toEqual([fake1, fake2, fake3]);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(hasMore).toBe(true);
            done();
        });
    });

    it("It retrieve the next batch of items", (done) => {
        view.fetchNext().pipe(
            flatMap(() => view.fetchNext()),
        ).subscribe(() => {
            expect(dataSpy).toHaveBeenCalledTimes(2);
            expect(items.toJS()).toEqual([fake1, fake2, fake3, fake4, fake5]);
            expect(hasMore).toBe(false);
            done();
        });
    });

    it("It fetch all", (done) => {
        view.fetchAll().subscribe(() => {
            expect(items.toJS()).toEqual([fake1, fake2, fake3, fake4, fake5]);
            expect(dataSpy).toHaveBeenCalledTimes(2);
            expect(hasMore).toBe(false);
            done();
        });
    });

    it("should clear the items when refresing with params true", (done) => {
        view.fetchNext().subscribe(() => {
            expect(dataSpy).toHaveBeenCalledTimes(1);
            const obs = view.refresh(true);
            expect(items.size).toBe(0, "Should have cleared the items");

            obs.subscribe(() => {
                expect(dataSpy).toHaveBeenCalledTimes(2);

                expect(items.toJS()).toEqual([fake1, fake2, fake3]);
                done();
            });
        });
    });

    it("should not clear the items when refresing with params false", (done) => {
        view.fetchNext().subscribe(() => {
            expect(dataSpy).toHaveBeenCalledTimes(1);
            const obs = view.refresh(false);
            expect(items.size).not.toBe(0, "Should NOT have cleared the items");

            items = List(); // Make sure it get the new value
            obs.subscribe(() => {
                view.items.subscribe(x => items = x);
                expect(dataSpy).toHaveBeenCalledTimes(2);
                expect(items.toJS()).toEqual([fake1, fake2, fake3]);
                done();
            });
        });
    });

    it("#refreshAll() should get all the items", (done) => {
        items = List([]); // Reset the items to make sure it loads all of them again
        view.refreshAll().subscribe(() => {
            expect(items.toJS()).toEqual([fake1, fake2, fake3, fake4, fake5]);
            done();
        });
    });

    it("it should apply the options", (done) => {
        view.fetchNext().subscribe(() => {
            expect(items.toJS()).toEqual([fake1, fake2, fake3]);
            expect(dataSpy).toHaveBeenCalledTimes(1);

            view.setOptions({ filter: filters.filter2 });
            view.fetchNext().subscribe(() => {
                expect(dataSpy).toHaveBeenCalledTimes(2);
                expect(items.toJS()).toEqual([fake1, fake3, fake4], "Should have updated to the new data");
                expect(hasMore).toBe(false);
                done();
            });
        });
    });

    it("should return hasMore false if there is only 1 page of data after first fetch", (done) => {
        view.setOptions({ filter: filters.filter2 });
        view.fetchNext().subscribe(() => {
            expect(items.toJS()).toEqual([fake1, fake3, fake4]);
            expect(hasMore).toBe(false);
            done();
        });
    });

    it("Should remove item from the list when the cache call onItemDeleted", (done) => {
        view.fetchNext().subscribe(() => {
            const subSpy = jasmine.createSpy("items sub");
            view.items.subscribe(subSpy);
            expect(subSpy).toHaveBeenCalledTimes(1); // Should initialy get called
            cache.deleteItemByKey("2");
            expect(subSpy).toHaveBeenCalledTimes(2); // Should not have been called more than once

            const newList = [fake1, fake3];
            expect(items.toJS()).toEqual(newList);
            done();
        });
    });

    describe("#loadNewItem()", () => {
        beforeEach((done) => {
            view.fetchNext().subscribe(() => done());
        });

        it("should NOT add the item if already present and update exiting one", (done) => {
            const getter = new BasicEntityGetter(FakeModel, {
                cache: () => cache,
                supplyData: () => of({ id: "2", state: "running", name: "Fake2" }),
            });
            const expected = [
                fake1,
                { id: "2", parentId: "parent-1", state: "running", name: "Fake2" },
                fake3,
            ];

            view.loadNewItem(getter.fetch({ parentId: "parent-1", id: "2" })).subscribe(() => {
                expect(items.toJS()).toEqual(expected);
                done();
            });
        });

        it("should add the item if NOT already present", (done) => {
            const getter = new BasicEntityGetter(FakeModel, {
                cache: () => cache,
                supplyData: () => of({ id: "4", state: "running", name: "Fake4" }),
            });
            const expected = [
                { id: "4", parentId: "parent-1", state: "running", name: "Fake4" },
            ].concat([fake1, fake2, fake3]);

            view.loadNewItem(getter.fetch({ parentId: "parent-1", id: "4" })).subscribe(() => {
                expect(items.toJS()).toEqual(expected);
                done();
            });
        });
    });

    describe("when there is keys in the cachedKeys", () => {
        beforeEach((done) => {
            // This should set the query cache
            view.setOptions({ filter: filters.filter2 });
            view.fetchNext().subscribe(() => done());
        });

        it("should have set the query cache", () => {
            const queryCache = cache.queryCache.getKeys(filters.filter2.toOData());
            expect(queryCache).not.toBeFalsy();
            expect(queryCache.keys).toEqualImmutable(OrderedSet(["1", "3", "4"]));
        });
    });

    describe("when first call returns an error", () => {
        let thrownError: ServerError;
        beforeEach((done) => {
            view.setOptions({ filter: filters.badFilter });
            view.fetchNext().subscribe(
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
            expect(dataSpy).toHaveBeenCalledOnce();
            view.fetchNext().subscribe(() => {
                // only the initial call
                expect(dataSpy).toHaveBeenCalledOnce();
                done();
            }, () => {
                expect(false).toBe(true, "Should not have returned a failure here");
            });
        });

        it("should fetch next if forcing new data", (done) => {
            view.refresh().subscribe({
                next: () => {
                    // only the initial call
                    expect(false).toBe(true, "Should not have returned a success here");
                },
                error: () => {
                    expect(dataSpy).toHaveBeenCalledTimes(2);
                    done();
                },
            });
        });

        it("should fix the error if changing filter to a valid one", (done) => {
            view.setOptions({ filter: filters.filter1 });
            view.fetchNext().subscribe({
                next: () => {
                    expect(dataSpy).toHaveBeenCalledTimes(2);
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
