import { BasicEntityGetter, DataCache } from "@batch-flask/core";
import { of } from "rxjs";
import { FakeModel, FakeParams } from "../test/fake-model";
import { EntityGetter } from "./entity-getter";

const fake1 = { id: "1", parentId: "parent-1", state: "active", name: "Fake1" };
const fake2 = { id: "1", parentId: "parent-1", state: "running", name: "Fake1" };

const data = [
    { id: "1", state: "active", name: "Fake1" },
    { id: "1", state: "running", name: "Fake1" },
    { id: "1", state: "complated", name: "Fake1" },
];

describe("EntityGetter", () => {
    let getter: EntityGetter<FakeModel, FakeParams>;
    let cache: DataCache<FakeModel>;
    let dataSpy: jasmine.Spy;

    beforeEach(() => {
        cache = new DataCache<FakeModel>();
        dataSpy = jasmine.createSpy("supplyDataSpy")
            .and.returnValues(...data.map(x => of(x)));
        getter = new BasicEntityGetter(FakeModel, {
            cache: () => cache,
            supplyData: dataSpy,
        });
    });

    it("It retrieve the item", (done) => {
        getter.fetch({ parentId: "parent-1", id: "1" }).subscribe((item) => {
            expect(item.toJS()).toEqual(fake1);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(dataSpy).toHaveBeenCalledWith({ parentId: "parent-1", id: "1" });
            done();
        });
    });

    it("It retrieve the new item if not asked from cache", (done) => {
        getter.fetch({ parentId: "parent-1", id: "1" }).subscribe((item) => {
            expect(item.toJS()).toEqual(fake1);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(dataSpy).toHaveBeenCalledWith({ parentId: "parent-1", id: "1" });

            getter.fetch({ parentId: "parent-1", id: "1" }).subscribe((item) => {
                expect(item.toJS()).toEqual(fake2);
                expect(dataSpy).toHaveBeenCalledTimes(2);
                expect(dataSpy).toHaveBeenCalledWith({ parentId: "parent-1", id: "1" });
                done();
            });
        });
    });

    it("It retrieve the item from cache if asked too", (done) => {
        getter.fetch({ parentId: "parent-1", id: "1" }).subscribe((item) => {
            expect(item.toJS()).toEqual(fake1);
            expect(dataSpy).toHaveBeenCalledTimes(1);
            expect(dataSpy).toHaveBeenCalledWith({ parentId: "parent-1", id: "1" });

            getter.fetch({ parentId: "parent-1", id: "1" }, { cached: true }).subscribe((item) => {
                expect(item.toJS()).toEqual(fake1);
                expect(dataSpy).toHaveBeenCalledTimes(1); // Should not have been called again as its loading from cache
                expect(dataSpy).toHaveBeenCalledWith({ parentId: "parent-1", id: "1" });
                done();
            });
        });
    });
});
