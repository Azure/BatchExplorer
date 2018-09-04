import { Model, Record } from "@batch-flask/core";
import { AbstractListItem } from "@batch-flask/ui/abstract-list/abstract-list-item";
import { List } from "immutable";
import { MockListView } from "test/utils/mocks";
import { ListDataProvider } from "./list-data-provider";

@Model()
class FakeModel extends Record<any> implements AbstractListItem {
    public disabled: false;
    public routerLink: any[];

    constructor(public id: string) {
        super();
        this.routerLink = ["/items", id];
    }

    public getLabel() {
        return this.id;
    }
}

const item1 = new FakeModel("i-1");
const item2 = new FakeModel("i-2");
const item3 = new FakeModel("i-3");
const item4 = new FakeModel("i-4");
const item5 = new FakeModel("i-5");

describe("ListDataProvider", () => {
    let provider: ListDataProvider;
    let items: any[];

    beforeEach(() => {
        provider = new ListDataProvider();
        items = [];
        provider.items.subscribe(x => items = x);
    });

    it("Creates data from an array", () => {
        provider.data = [item1, item3, item4];
        expect(items).toEqual([item1, item3, item4]);
    });

    it("Creates data from an immutable list", () => {
        provider.data = List([item1, item3, item4]);
        expect(items).toEqual([item1, item3, item4]);
    });

    it("fetch all does nothing if data is a list", () => {
        provider.data = [item1, item3, item4];
        provider.fetchAll();
        expect(items).toEqual([item1, item3, item4]);
    });

    describe("when data is a list view", () => {
        let view: MockListView<any, any>;

        beforeEach(() => {
            view = new MockListView(Record, { items: [item1, item3, item4] });
            provider.data = view;
        });

        it("data is empty until fetch next", (done) => {
            expect(items).toEqual([]);
            view.fetchNext().subscribe(() => {
                expect(items).toEqual([item1, item3, item4]);
                done();
            });
        });

        it("updates items in provider when list view changes", (done) => {
            view.fetchNext().subscribe(() => {
                view.updateItems([item1, item2, item3, item4, item5]);
                view.refresh().subscribe(() => {
                    expect(items).toEqual([item1, item2, item3, item4, item5]);
                    done();
                });
            });
        });

        it("fetch all items when asked", () => {
            spyOn(view, "fetchAll");
            provider.fetchAll();
            expect(view.fetchAll).toHaveBeenCalledOnce();
        });
    });
});
