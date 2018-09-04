import { ListView, LoadingStatus } from "@batch-flask/core";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subscription, of } from "rxjs";
import { AbstractListItem } from "../abstract-list-item";

/**
 * Class handling different types of data inputs and unify them
 */
export class ListDataProvider {
    public items: Observable<AbstractListItem[]>;
    public status: Observable<LoadingStatus>;
    public newDataStatus: Observable<LoadingStatus>;
    public hasMore: Observable<boolean>;

    private _items = new BehaviorSubject<AbstractListItem[]>([]);
    private _status = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    private _newDataStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    private _hasMore = new BehaviorSubject<boolean>(true);
    private _dataSubs: Subscription[] = [];
    private _data: ListView<any, any> | List<AbstractListItem> | Iterable<AbstractListItem>;

    constructor() {
        this.items = this._items.asObservable();
        this.status = this._status.asObservable();
        this.newDataStatus = this._newDataStatus.asObservable();
        this.hasMore = this._hasMore.asObservable();
    }

    public dispose() {
        this._items.complete();
        this._status.complete();
        this._hasMore.complete();
        this._clearDataSubs();
    }

    public set data(data: ListView<any, any> | List<AbstractListItem> | Iterable<AbstractListItem>) {
        this._clearDataSubs();
        this._data = data;
        let ready = true;
        if (!data) {
            this._items.next([]);
        } else if (data instanceof ListView) {
            ready = false;
            this._watchListView(data);
        } else if (data instanceof List) {
            this._items.next((data as List<any>).toArray());
        } else if (Array.isArray(data)) {
            this._items.next(data);
        } else {
            this._items.next([...data as any]);
        }

        if (ready) {
            this._status.next(LoadingStatus.Ready);
            this._hasMore.next(false);
        }
    }

    public fetchAll() {
        if (this._data instanceof ListView) {
            return this._data.fetchAll();
        } else {
            return of(null);
        }
    }

    private _watchListView(data: ListView<any, any>) {
        this._dataSubs.push(data.items.subscribe((items) => {
            this._items.next(items.toArray());
        }));
        this._dataSubs.push(data.status.subscribe((status) => {
            this._status.next(status);
        }));
        this._dataSubs.push(data.newDataStatus.subscribe((status) => {
            this._newDataStatus.next(status);
        }));
        this._dataSubs.push(data.hasMore.subscribe((hasMore) => {
            this._hasMore.next(hasMore);
        }));
    }

    private _clearDataSubs() {
        this._dataSubs.forEach(x => x.unsubscribe());
    }
}
