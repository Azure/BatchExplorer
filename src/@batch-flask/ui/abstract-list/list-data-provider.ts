import { ListView, LoadingStatus } from "@batch-flask/core";
import { AbstractListItem } from "@batch-flask/ui/abstract-list";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

/**
 * Class handling different types of data inputs and unify them
 */
export class ListDataProvider {
    public items: Observable<AbstractListItem[]>;
    public status: Observable<LoadingStatus>;

    private _items = new BehaviorSubject<AbstractListItem[]>([]);
    private _status = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    private _dataSubs: Subscription[] = [];

    constructor() {
        this.items = this._items.asObservable();
        this.status = this._status.asObservable();
    }

    public dispose() {
        this._items.complete();
        this._status.complete();
        this._clearDataSubs();
    }

    public set data(data: ListView<AbstractListItem, any> | List<AbstractListItem> | Iterable<AbstractListItem>) {
        this._clearDataSubs();
        if (!data) {
            this._items.next([]);
        } else if (data instanceof ListView) {
            this._watchListView(data);
        } else if (data instanceof List) {
            this._items.next((data as List<any>).toArray());
        } else if (Array.isArray(data)) {
            this._items.next(data);
        } else {
            this._items.next([...data as any]);
        }
    }

    private _watchListView(data: ListView<AbstractListItem, any>) {
        this._dataSubs.push(data.items.subscribe((items) => {
            this._items.next(items.toArray());
        }));
        this._dataSubs.push(data.status.subscribe((status) => {
            this._status.next(status);
        }));
    }

    private _clearDataSubs() {
        this._dataSubs.forEach(x => x.unsubscribe());
    }
}
