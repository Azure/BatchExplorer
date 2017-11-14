import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { PinnedEntity, PinnedEntityType } from "app/models";
import { LocalFileStorage } from "./local-file-storage.service";

@Injectable()
export class PinnedEntityService {
    public loaded: Observable<boolean>;
    public favourites: Observable<List<PinnedEntity>>;

    private _pinnedFavouritesJsonFileName: string = "pinned-favorites";
    private _favorites: BehaviorSubject<List<PinnedEntity>> = new BehaviorSubject(List([]));
    private _loaded = new BehaviorSubject<boolean>(false);

    constructor(private localFileStorage: LocalFileStorage) {
        this.loaded = this._loaded.asObservable();
    }

    public get favorites(): Observable<List<PinnedEntity>> {
        return this._favorites.asObservable();
    }

    public pinFavorite(id: string, type: PinnedEntityType): Observable<any> {
        if (this.isFavorite(id)) {
            return Observable.of(true);
        }

        const subject = new AsyncSubject();
        const favourite = new PinnedEntity({
            id: id,
            routerLink: null,
            type: type,
        });

        this._favorites.next(this._favorites.getValue().push(favourite));
        this._saveAccountFavorites().subscribe({
            next: (account) => {
                subject.complete();
            }, error: (e) => {
                subject.error(e);
            },
        });

        return subject.asObservable();
    }

    public unPinFavorite(id: string) {
        id = id.toLowerCase();
        if (!this.isFavorite(id)) {
            return;
        }

        // todo: job and pool can have the same id, use URL ...
        const newAccounts = this._favorites.getValue().filter(pinned => pinned.id.toLowerCase() !== id);
        this._favorites.next(List<PinnedEntity>(newAccounts));
        this._saveAccountFavorites();
    }

    public isFavorite(id: string): boolean {
        id = id.toLowerCase();
        const favorites = this._favorites.getValue();
        const account = favorites.filter(pinned => pinned.id === id).first();

        return Boolean(account);
    }

    public loadInitialData() {
        this._loadFavoriteAccounts().subscribe((accounts) => {
            this._favorites.next(accounts);
            this._loaded.next(true);
        });
    }

    private _loadFavoriteAccounts(): Observable<List<PinnedEntity>> {
        return this.localFileStorage.get(this._pinnedFavouritesJsonFileName).map((data) => {
            if (Array.isArray(data)) {
                return List(data.map(x => new PinnedEntity(x)));
            } else {
                return List([]);
            }
        }).share();
    }

    private _saveAccountFavorites(favourites: List<PinnedEntity> = null): Observable<any> {
        favourites = favourites === null ? this._favorites.getValue() : favourites;
        return this.localFileStorage.set(this._pinnedFavouritesJsonFileName, favourites.toJS());
    }
}
