import { fakeAsync, tick } from "@angular/core/testing";
import { BasicEntityGetter, DataCache, EntityGetter, EntityView, ServerError } from "@batch-flask/core";
import { from, throwError } from "rxjs";
import { FakeModel, FakeParams } from "../test/fake-model";

const data = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "1", state: "running", name: "Fake1" },
    { id: "1", state: "complated", name: "Fake1" },
];

describe("EntityView", () => {
    let cache: DataCache<FakeModel>;
    let dataSpy: jasmine.Spy;
    let getter: EntityGetter<FakeModel, FakeParams>;

    let view: EntityView<FakeModel, FakeParams>;
    let item: FakeModel | null;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        dataSpy = jasmine.createSpy("supplyDataSpy")
            .and.returnValues(...data.map(x => from(Promise.resolve(x))));
        getter = new BasicEntityGetter(FakeModel, {
            cache: () => cache,
            supplyData: dataSpy,
        });

        view = new EntityView({
            cache: () => cache,
            getter: getter,
        });
        view.params = { id: "1" };
    });

    afterEach(() => {
        view.dispose();
    });

    it("It retrieve the item", fakeAsync(() => {
        view.item.subscribe(x => item = x);

        view.fetch();
        tick();
        expect(dataSpy).toHaveBeenCalledTimes(1);
        expect(item!.toJS()).toEqual(data[0]);
        expect(dataSpy).toHaveBeenCalledWith({ id: "1" });
    }));

    it("should use the cached value", fakeAsync(() => {
        cache.addItem(new FakeModel({ id: "1", state: "creating", name: "Fake1" }));

        view.item.subscribe(x => item = x);
        view.fetch();
        expect(item).not.toBeFalsy();
        expect(item!.toJS()).toEqual({ id: "1", state: "creating", name: "Fake1" });

        tick(); // This should be the return from the fetched data
        expect(item!.toJS()).toEqual(data[0]);
    }));

    it("Update the data when refreshing", fakeAsync(() => {
        view.item.subscribe(x => item = x);
        view.fetch();
        tick();
        expect(item!.toJS()).toEqual(data[0]);

        view.refresh();
        tick();
        expect(item!.toJS()).toEqual(data[1]);

        view.refresh();
        tick();
        expect(item!.toJS()).toEqual(data[2]);
        expect(dataSpy).toHaveBeenCalledTimes(3);
    }));

    it("Update the params", fakeAsync(() => {
        view.item.subscribe(x => item = x);
        view.params = { id: "2" };
        view.fetch();
        tick();
        expect(item!.toJS()).toEqual(data[0]);
        expect(dataSpy).toHaveBeenCalledWith({ id: "2" });
    }));

    it("Update the params", fakeAsync(() => {
        view.item.subscribe(x => item = x);
        view.params = { id: "2" };
        view.fetch();
        tick();
        expect(item!.toJS()).toEqual(data[0]);
        expect(dataSpy).toHaveBeenCalledWith({ id: "2" });
    }));

    it("Update the cache should update the item", fakeAsync(() => {
        view.item.subscribe(x => item = x);
        view.fetch();
        tick();
        expect(item!.toJS()).toEqual(data[0]);
        expect(item).toEqualImmutable(new FakeModel(data[0]));
        expect(dataSpy).toHaveBeenCalledTimes(1);
        expect(dataSpy).toHaveBeenCalledWith({ id: "1" });

        cache.addItem(new FakeModel(data[2]));
        tick();
        expect(item!.toJS()).toEqual(data[2]);
    }));

    describe("When it return a 404 error", () => {
        let item: FakeModel | null;
        let deleted: string | null;

        beforeEach(() => {
            item = null;
            deleted = null;
            const responses = [
                from(Promise.resolve(data[0])),
                throwError(new ServerError({ status: 404, message: "404 not found" } as any)),
            ];
            dataSpy = jasmine.createSpy("supplyDataSpy")
                .and.returnValues(...responses);
            getter = new BasicEntityGetter(FakeModel, {
                cache: () => cache,
                supplyData: dataSpy,
            });

            view.dispose();
            view = new EntityView({
                cache: () => cache,
                getter: getter,
            });
            view.params = { id: "1" };
        });

        it("should not send to delete if loading for the first time and I get a 404", fakeAsync(() => {
            getter = new BasicEntityGetter(FakeModel, {
                cache: () => cache,
                supplyData: () => throwError(new ServerError({ status: 404, message: "404 not found" } as any)),
            });
            view.dispose();
            view = new EntityView({
                cache: () => cache,
                getter: getter,
            });
            view.params = { id: "1" };

            view.item.subscribe(x => item = x);
            view.deleted.subscribe((x) => deleted = x);
            view.fetch();
            tick();
            expect(item).toBeNull();
            expect(deleted).toBe(null);
        }));

        it("should send event to deleted if return 404 after loading once", fakeAsync(() => {
            const otherView = new EntityView({
                cache: () => cache,
                getter: getter,
            });
            otherView.params = { id: "1" };

            view.item.subscribe(x => item = x);
            cache.deleted.subscribe(x => deleted = x);
            otherView.fetch();
            tick();

            expect(deleted).toBe(null);

            // This fetch should return an 404 error
            otherView.fetch();
            tick();

            expect(deleted).toEqual("1");
            otherView.dispose();
        }));

        it("should not send to deleted if loading a new item that doesn't exist", fakeAsync(() => {
            view.item.subscribe(x => item = x);
            view.deleted.subscribe(x => deleted = x);
            view.fetch();
            tick();

            // expect(deleted).toBe(null);

            // This fetch should return an 404 error
            view.params = { id: "2" };
            view.fetch();
            tick();

            // expect(item).toBeUndefined();
            // expect(deleted).toBe(null);
        }));
    });
});
