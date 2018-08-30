import { ListDataSorter, ListSortConfig } from "@batch-flask/ui/abstract-list/list-data-sorter";
import { SortDirection } from "@batch-flask/ui/table/table-column-manager";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { AbstractListItem } from "./abstract-list-item";
import { ListDataProvider } from "./list-data-provider";

/**
 * Class that given items input handle sorting and filtering them
 */
export class ListDataPresenter {
    public items: Observable<AbstractListItem[]>;
    public config: ListSortConfig<AbstractListItem> | null | false;

    private _sub: Subscription;
    private _items = new BehaviorSubject<AbstractListItem[]>([]);
    private _input: AbstractListItem[];
    private _sortingBy: { key: string | null, direction?: SortDirection } = { key: null };

    constructor(dataProvider: ListDataProvider) {
        this.items = this._items.asObservable();
        this._sub = dataProvider.items.subscribe((items) => {
            this._input = items;
            this._updateDisplayedItems();
        });
    }

    public dispose() {
        this._sub.unsubscribe();
        this._items.complete();
    }

    public get sortingBy(): { key: string | null, direction?: SortDirection } {
        return this._sortingBy;
    }

    public sortBy(key: string, direction?: SortDirection) {
        this._sortingBy = { key, direction };
        this._updateDisplayedItems();
    }

    public updateSortDirection(direction?: SortDirection) {
        if (direction !== this._sortingBy.direction) {
            this._sortingBy = { key: this._sortingBy.key, direction };
            this._items.next(this._items.value.reverse());
        }
    }

    private _updateDisplayedItems() {
        this._items.next(this._sortItems(this._input));
    }

    private _sortItems(items: AbstractListItem[]): AbstractListItem[] {
        if (this._sortingBy.key && this.config) {
            const sorter = new ListDataSorter(this.config);
            return sorter.sortBy(items, this._sortingBy.key, this._sortingBy.direction);
        } else {
            return items;
        }
    }
}
