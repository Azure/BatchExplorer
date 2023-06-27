import { SimpleChange } from "@angular/core";
import { BasicListGetter, DataCache, ListView , Model, Prop, Record } from "@batch-flask/core";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";

export interface FakeModelAttributes {
    id: string;
    state: string;
    name: string;
}

@Model()
export class FakeModel extends Record<FakeModelAttributes> {
    @Prop() public id: string;
    @Prop() public state: string;
    @Prop() public name: string;
}

export interface FakeParams {
    id: string;
}

describe("ComponentUtils", () => {
    describe("#recordChanged", () => {
        it("returns true when record is with a different id", () => {
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                { id: "id-1" }, { id: "id-2" }, false,
            ))).toBe(true);
        });

        it("returns true when record didn't exist before", () => {
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                undefined, { id: "id-2" }, false,
            ))).toBe(true);
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                null, { id: "id-2" }, false,
            ))).toBe(true);
        });

        it("returns true when record doesn't exist now", () => {
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                { id: "id-2" }, null, false,
            ))).toBe(true);
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                { id: "id-2" }, undefined, false,
            ))).toBe(true);
        });

        it("returns false when record has same id but different props", () => {
            expect(ComponentUtils.recordChangedId(new SimpleChange(
                { id: "id-1", state: "running" }, { id: "id-1", state: "completed" }, false,
            ))).toBe(false);
        });
    });

    describe("#setActiveItem", () => {
        const pool1 = new FakeModel({id: "pool-1", state: "running"});
        const pool2 = new FakeModel({id: "pool-2", state: "idle"});
        const pool3 = new FakeModel({id: "pool-3", state: "started"});

        let childRoute = null;
        let mockRoute;
        let cache: DataCache<FakeModel>;
        let getter;
        let view: ListView<FakeModel, any>;
        let items: List<FakeModel>;

        beforeEach(() => {
            mockRoute = {
                url: new BehaviorSubject("/pools/pool-1"),
                snapshot: {
                    get firstChild() {
                        return childRoute;
                    },
                },
            };
            cache = new DataCache<FakeModel>();
            cache.addItems([pool1, pool2, pool3]);
            getter = new BasicListGetter(FakeModel, {
                cache: () => cache,
                supplyData: () => of({ data: [pool1.toJS(), pool2.toJS()] }),
            });
            view = new ListView({
                cache: () => cache,
                getter: getter,
            });
            view.fetchNext();
            view.items.subscribe(x => items = x);
        });

        afterEach(() => {
            view.dispose();
        });

        it("prepend the missing item to the begining of the list", () => {
            childRoute = {
                params: { id: "pool-3" },
            };

            ComponentUtils.setActiveItem(mockRoute, view);
            expect(items.size).toBe(3);
            expect(items.get(0).toJS()).toEqual(pool3.toJS());
            expect(items.get(1).toJS()).toEqual(pool1.toJS());
            expect(items.get(2).toJS()).toEqual(pool2.toJS());
        });

        it("remove the prepended item when no params", () => {
            childRoute = null;

            ComponentUtils.setActiveItem(mockRoute, view);
            expect(items.size).toBe(2);
            expect(items.get(0).toJS()).toEqual(pool1.toJS());
            expect(items.get(1).toJS()).toEqual(pool2.toJS());
        });

        it("create an empty object with just id when not loaded in cache already", () => {
            childRoute = {
                params: { id: "pool-99" },
            };

            ComponentUtils.setActiveItem(mockRoute, view);
            expect(items.size).toBe(3);
            expect(items.get(0).toJS()).toEqual({id: "pool-99", state: null, name: null});
            expect(items.get(1).toJS()).toEqual(pool1.toJS());
            expect(items.get(2).toJS()).toEqual(pool2.toJS());
        });
    });
});
