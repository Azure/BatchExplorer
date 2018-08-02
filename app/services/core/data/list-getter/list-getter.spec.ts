import { fakeAsync, tick } from "@angular/core/testing";
import { BasicListGetter, DataCache } from "app/services/core";
import { Observable, of, timer } from "rxjs";
import { FakeModel } from "test/app/services/core/data/fake-model";
import { flatMap, map } from "rxjs/operators";

const firstPage = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "2", state: "active", name: "Fake2" },
    { id: "3", state: "running", name: "Fake3" },
];

const secondPage = [
    { id: "4", state: "running", name: "Fake4" },
    { id: "5", state: "completed", name: "Fake5" },
];

const data = [
    {
        data: firstPage,
        nextLink: "#page2",
    },
    {
        data: secondPage,
    },
];

describe("ListGetter", () => {
    let getter: BasicListGetter<FakeModel, {}>;
    let cache: DataCache<FakeModel>;
    let dataSpy: jasmine.Spy;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        dataSpy = jasmine.createSpy("supplyDataSpy")
            .and.returnValues(...data.map(x => of(x)));
        getter = new BasicListGetter(FakeModel, {
            cache: () => cache,
            supplyData: dataSpy,
        });
    });

    it("It retrieve the first batch of items", (done) => {
        getter.fetch({}).subscribe(({ items, nextLink }) => {
            expect(items.toJS()).toEqual(firstPage);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(nextLink).toBeTruthy();
            done();
        });
    });

    it("It retrieve the next batch of items", (done) => {
        getter.fetch({}).pipe(flatMap(({ nextLink }) => {
            return getter.fetch(nextLink);
        })).subscribe(({ items, nextLink }) => {
            expect(items.toJS()).toEqual(secondPage);
            expect(dataSpy).toHaveBeenCalledTimes(2);
            expect(nextLink).toBeFalsy();
            done();
        });
    });

    it("#fetchAll() should get all the items", (done) => {
        getter.fetchAll({}).subscribe((items) => {
            expect(items.toJS()).toEqual(firstPage.concat(secondPage));
            expect(dataSpy).toHaveBeenCalledTimes(2);
            done();
        });
    });

    it("It retrieve items from the cache unless specified", (done) => {
        getter.fetch({}).subscribe(({ items, nextLink }) => {
            expect(items.toJS()).toEqual(firstPage);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(nextLink).toBeTruthy();

            getter.fetch({}).subscribe((newResponse) => {
                expect(newResponse.items.toJS()).toEqual(firstPage);
                expect(newResponse.nextLink).toEqual(nextLink);
                expect(dataSpy).toHaveBeenCalledTimes(1); // Should not have been called again
                done();
            });
        });
    });

    it("It retrieve fresh items from the cache when setting forceNew", (done) => {
        getter.fetch({}).subscribe(({ items, nextLink }) => {
            expect(items.toJS()).toEqual(firstPage);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(nextLink).toBeTruthy();
            expect(dataSpy).toHaveBeenCalledWith({}, jasmine.anything()); // Should have been called again

            getter.fetch({}, {}, true).subscribe((newResponse) => {
                expect(dataSpy).toHaveBeenCalledTimes(2); // Should have been called again
                expect(dataSpy).toHaveBeenCalledWith({}, jasmine.anything()); // Should have been called again
                done();
            });
        });
    });

    it("cancel the request when unsubscribing fetchall", fakeAsync(() => {
        dataSpy = jasmine.createSpy("supplyDataSpy").and.callFake(() => {
            return timer(100).pipe(map(x => ({
                data: [{ id: "1", state: "active", name: "Fake1" }],
                nextLink: "more-to-load",
            })));
        });

        getter = new BasicListGetter(FakeModel, {
            cache: () => cache,
            supplyData: dataSpy,
        });

        const sub = getter.fetchAll({}).subscribe();
        expect(dataSpy).toHaveBeenCalledTimes(1);
        tick(100);
        expect(dataSpy).toHaveBeenCalledTimes(2);
        sub.unsubscribe();
        tick(100);
        // Should not have been called anymore
        expect(dataSpy).toHaveBeenCalledTimes(2);
        tick(1000);
        expect(dataSpy).toHaveBeenCalledTimes(2);
    }));
});
