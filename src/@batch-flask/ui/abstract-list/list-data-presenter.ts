import { LoadingStatus } from "@batch-flask/ui/loading";
import { nil } from "@batch-flask/utils";
import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AbstractListItem } from "./abstract-list-item";
import { ListDataProvider } from "./list-data-provider";
import {
    ListDataSorter, ListSortConfig, SortDirection, SortingStatus,
} from "./list-data-sorter";

export interface SortingInfo {
    key: string | null;
    direction: SortDirection;
}

/**
 * Class that given items input handle sorting and filtering them
 */
export class ListDataPresenter {
    public items: Observable<AbstractListItem[]>;
    public sortingStatus: Observable<SortingStatus>;
    public sortingByObs: Observable<SortingInfo>;
    public config: ListSortConfig<AbstractListItem> | null | false;

    private _sub: Subscription;
    private _items = new BehaviorSubject<AbstractListItem[]>([]);
    private _input: AbstractListItem[];
    private _sortingStatus = new BehaviorSubject<SortingStatus>(SortingStatus.Valid);
    private _sortingBy = new BehaviorSubject<SortingInfo>({ key: null, direction: SortDirection.Asc });

    constructor(dataProvider: ListDataProvider) {
        this.items = this._items.asObservable();
        this.sortingStatus = this._sortingStatus.asObservable();
        this.sortingByObs = this._sortingBy.asObservable();
        this._sub = dataProvider.items.subscribe((items) => {
            this._input = items;
            this._updateDisplayedItems();
        });

        this.sortingStatus = combineLatest(dataProvider.newDataStatus, dataProvider.hasMore, this._sortingBy).pipe(
            map(([status, hasMore, sortingBy]) => {
                if (status !== LoadingStatus.Ready || !sortingBy.key) { return SortingStatus.Valid; }
                return hasMore ? SortingStatus.Partial : SortingStatus.Valid;
            }),
        );
    }

    public dispose() {
        this._sub.unsubscribe();
        this._sortingBy.complete();
        this._items.complete();
    }

    public get sortingBy(): SortingInfo {
        return this._sortingBy.value;
    }

    public sortBy(key: string, direction?: SortDirection) {
        this._sortingBy.next({ key, direction: nil(direction) ? this.sortingBy.direction : direction });
        this._updateDisplayedItems();
    }

    public updateSortDirection(direction?: SortDirection) {
        if (direction !== this.sortingBy.direction) {
            this._sortingBy.next({ key: this.sortingBy.key, direction });
            this._items.next([...this._items.value].reverse());
        }
    }

    private _updateDisplayedItems() {
        this._items.next(this._sortItems(this._input));
    }

    private _sortItems(items: AbstractListItem[]): AbstractListItem[] {
        if (this.sortingBy.key && this.config) {
            const sorter = new ListDataSorter(this.config);
            return sorter.sortBy(items, this.sortingBy.key, this.sortingBy.direction);
        } else {
            return items;
        }
    }
}
