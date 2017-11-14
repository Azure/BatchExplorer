import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { PinnableEntity, PinnedEntity } from "app/models";
import { AccountService } from "./account.service";
import { LocalFileStorage } from "./local-file-storage.service";

@Injectable()
export class PinnedEntityService {
    public loaded: Observable<boolean>;
    public favourites: Observable<List<PinnedEntity>>;

    private _pinnedFavouritesJsonFileName: string = "pinned-favorites";
    private _favorites: BehaviorSubject<List<PinnedEntity>> = new BehaviorSubject(List([]));
    private _loaded = new BehaviorSubject<boolean>(false);
    private _currentAccountUrl: string = "";

    constructor(
        private localFileStorage: LocalFileStorage,
        private accountService: AccountService) {

        this.loaded = this._loaded.asObservable();
        this.accountService.currentAccount.subscribe((account) => {
            this._currentAccountUrl = account.properties.accountEndpoint;
            this._favorites.next(List<PinnedEntity>());
            this._loadInitialData();
        });
    }

    public get favorites(): Observable<List<PinnedEntity>> {
        return this._favorites.asObservable();
    }

    public pinFavorite(entity: PinnableEntity): Observable<any> {
        if (this.isFavorite(entity.id)) {
            return Observable.of(true);
        }

        const subject = new AsyncSubject();
        const favourite = new PinnedEntity({
            id: entity.id,
            routerLink: entity.routerLink,
            pinnableType: entity.pinnableType,
            url: entity.url,
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

        // todo-andrew: job and pool can have the same id, use URL ...
        const newFavorites = this._favorites.getValue().filter(pinned => pinned.id.toLowerCase() !== id);
        this._favorites.next(List<PinnedEntity>(newFavorites));
        this._saveAccountFavorites();
    }

    public isFavorite(id: string): boolean {
        id = id.toLowerCase();
        const favorites = this._favorites.getValue();
        const account = favorites.filter(pinned => pinned.id === id).first();

        return Boolean(account);
    }

    private _loadInitialData() {
        this._loaded.next(false);
        this._loadFavorites().subscribe((favorites) => {
            this._favorites.next(favorites);
            this._loaded.next(true);
        });
    }

    private _loadFavorites(): Observable<List<PinnedEntity>> {
        console.log("loading favorites");
        return this.localFileStorage.get(this._jsonFilename).map((data) => {
            if (Array.isArray(data)) {
                return List(data.map(x => new PinnedEntity(x)));
            } else {
                return List([]);
            }
        }).share();
    }

    private _saveAccountFavorites(favourites: List<PinnedEntity> = null): Observable<any> {
        console.log("saving favorites");
        favourites = favourites === null ? this._favorites.getValue() : favourites;
        return this.localFileStorage.set(this._jsonFilename, favourites.toJS());
    }

    private get _jsonFilename(): string {
        console.log("filename: ", `${this._currentAccountUrl}.${this._pinnedFavouritesJsonFileName}`);
        return `${this._currentAccountUrl}.${this._pinnedFavouritesJsonFileName}`;
    }
}
