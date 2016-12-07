import {
    fakeAsync,
    tick,
} from "@angular/core/testing";

import { DataCache, RxEntityProxy } from "app/services/core";
import { FakeModel } from "./fake-model";

const data = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "1", state: "running", name: "Fake1" },
    { id: "1", state: "complated", name: "Fake1" },
];

describe("RxEnity proxy", () => {
    let proxy: RxEntityProxy<any, FakeModel>;
    let cache: DataCache<FakeModel>;
    let dataSpy: jasmine.Spy;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        dataSpy = jasmine.createSpy("").and.returnValues(...data.map(x => Promise.resolve({ data: x })));
        proxy = new RxEntityProxy(FakeModel, {
            cache: (params) => cache,
            getFn: dataSpy,
            initialParams: { id: "1" },
        });
    });

    it("It retrieve the item", fakeAsync(() => {
        let item: FakeModel;
        proxy.item.subscribe((x) => item = x);
        proxy.fetch();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[0]));
        expect(dataSpy).toHaveBeenCalledTimes(1);
        expect(dataSpy).toHaveBeenCalledWith({ id: "1" });
    }));

    it("Update the data when refreshing", fakeAsync(() => {
        let item: FakeModel;
        proxy.item.subscribe((x) => item = x);
        proxy.fetch();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[0]));

        proxy.refresh();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[1]));

        proxy.refresh();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[2]));
        expect(dataSpy).toHaveBeenCalledTimes(3);
    }));

    it("Update the params", fakeAsync(() => {
        let item: FakeModel;
        proxy.item.subscribe((x) => item = x);
        proxy.params = { id: "2" };
        proxy.fetch();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[0]));
        expect(dataSpy).toHaveBeenCalledWith({ id: "2" });
    }));

    it("Update the cache should update the item", fakeAsync(() => {
        let item: FakeModel;
        proxy.item.subscribe((x) => item = x);
        proxy.fetch();
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[0]));
        expect(dataSpy).toHaveBeenCalledTimes(1);
        expect(dataSpy).toHaveBeenCalledWith({ id: "1" });

        cache.addItem(new FakeModel(data[2]));
        tick();
        expect(item).toEqualImmutable(new FakeModel(data[2]));
    }));

    describe("When it return a 404 error", () => {
        let item: FakeModel = null;
        let deleted: string = null;
        let fakeClient: any;

        it("should not send to delete if loading for the first time and I get a 404", fakeAsync(() => {
            fakeClient = () => Promise.reject({ statusCode: 404 });
            proxy = new RxEntityProxy(FakeModel, {
                cache: (params) => cache,
                getFn: fakeClient,
                initialParams: { id: "1" },
            });

            proxy.item.subscribe((x) => item = x);
            proxy.deleted.subscribe((x) => deleted = x);
            proxy.fetch();
            tick();
            expect(item).toBeUndefined();
            expect(deleted).toBe(null);
        }));

        it("should send event to deleted if return 404 after loading once", fakeAsync(() => {
            let once = false;
            fakeClient = () => {
                if (once) {
                    return Promise.reject({ statusCode: 404 });
                } else {
                    once = true;
                    return Promise.resolve({ data: data[0] });
                }
            };
            const otherProxy = new RxEntityProxy(FakeModel, {
                cache: (params) => cache,
                getFn: fakeClient,
                initialParams: { id: "1" },
            });
            proxy.item.subscribe((x) => item = x);
            proxy.deleted.subscribe((x) => deleted = x);
            otherProxy.fetch();
            tick();

            expect(deleted).toBe(null);

            // This fetch should return an 404 error
            otherProxy.fetch();
            tick();

            expect(deleted).toEqual("1");
        }));

        it("should not send to deleted if loading a new item that doesn't exist", fakeAsync(() => {
            let once = false;
            fakeClient = () => {
                if (once) {
                    return Promise.reject({ statusCode: 404 });
                } else {
                    once = true;
                    return Promise.resolve({ data: data[0] });
                }
            };
            proxy = new RxEntityProxy(FakeModel, {
                cache: (params) => cache,
                getFn: fakeClient,
                initialParams: { id: "1" },
            });
            proxy.item.subscribe((x) => item = x);
            proxy.deleted.subscribe((x) => deleted = x);
            proxy.fetch();
            tick();

            // expect(deleted).toBe(null);

            // This fetch should return an 404 error
            proxy.params = { id: "2" };
            proxy.fetch();
            tick();

            // expect(item).toBeUndefined();
            // expect(deleted).toBe(null);
        }));
    });
});
