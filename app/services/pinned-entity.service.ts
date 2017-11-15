import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { PinnableEntity, PinnedEntity, PinnedEntityType } from "app/models";
import { AccountService } from "./account.service";
import { LocalFileStorage } from "./local-file-storage.service";

@Injectable()
export class PinnedEntityService {
    public loaded: Observable<boolean>;
    public favourites: Observable<List<PinnedEntity>>;

    private _pinnedFavouritesJsonFileName: string = "pinned-favorites";
    private _favorites: BehaviorSubject<List<PinnedEntity>> = new BehaviorSubject(List([]));
    private _loaded = new BehaviorSubject<boolean>(false);
    private _currentAccountEndpoint: string = "";

    constructor(
        private localFileStorage: LocalFileStorage,
        private accountService: AccountService) {

        this.loaded = this._loaded.asObservable();
        this.accountService.currentAccount.subscribe((account) => {
            this._currentAccountEndpoint = account.properties.accountEndpoint;
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
            url:  this._fudgeArmUrl(entity),
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

        // todo-andrew: job and pool can have the same id, use URL, or ID and Type ...
        const newFavorites = this._favorites.getValue().filter(pinned => pinned.id.toLowerCase() !== id);
        this._favorites.next(List<PinnedEntity>(newFavorites));
        this._saveAccountFavorites();
    }

    public isFavorite(id: string): boolean {
        id = id.toLowerCase();
        const favorites = this._favorites.getValue();
        const found = favorites.filter(pinned => pinned.id.toLowerCase() === id).first();

        return Boolean(found);
    }

    private _loadInitialData() {
        this._loaded.next(false);
        this._loadFavorites().subscribe((favorites) => {
            this._favorites.next(favorites);
            this._loaded.next(true);
        });
    }

    private _loadFavorites(): Observable<List<PinnedEntity>> {
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

    /**
     * Only RDFE entities have a URL property. We need to invent
     * one for ARM entities so we can use the current ID selection in
     * the drop down.
     */
    private _fudgeArmUrl(favorite: PinnableEntity) {
        if (!favorite.url || favorite.pinnableType === PinnedEntityType.BatchApplication) {
            return `https://${this._currentAccountEndpoint}/applications/${favorite.id}`;
        }

        return favorite.url;
    }

    private get _jsonFilename(): string {
        return `${this._currentAccountEndpoint}.${this._pinnedFavouritesJsonFileName}`;
    }
}
