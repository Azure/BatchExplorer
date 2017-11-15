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

    private _pinnedFavouritesJsonFileName: string = "pinned";
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
        if (this.isFavorite(entity)) {
            return Observable.of(true);
        }

        const subject = new AsyncSubject();
        const favourite = new PinnedEntity({
            id: entity.id,
            name: entity.name,
            routerLink: entity.routerLink,
            pinnableType: entity.pinnableType,
            url:  this._fudgeArmUrl(entity),
        });

        this._favorites.next(this._favorites.getValue().push(favourite));
        this._saveAccountFavorites().subscribe({
            next: (favourite) => {
                subject.complete();
            }, error: (e) => {
                subject.error(e);
            },
        });

        return subject.asObservable();
    }

    public unPinFavorite(entity: PinnableEntity) {
        if (!this.isFavorite(entity)) {
            return;
        }

        const url = this._fudgeArmUrl(entity);
        const newFavorites = this._favorites.getValue().filter(pinned => pinned.url !== url);
        this._favorites.next(List<PinnedEntity>(newFavorites));
        this._saveAccountFavorites();
    }

    public isFavorite(entity: PinnableEntity): boolean {
        const id = entity.id.toLowerCase();
        const favorites = this._favorites.getValue();
        const found = favorites.filter((pinned) => {
            return pinned.id.toLowerCase() === id && pinned.pinnableType === entity.pinnableType;
        }).first();

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
        favourites = favourites === null ? this._favorites.getValue() : favourites;
        return this.localFileStorage.set(this._jsonFilename, favourites.toJS());
    }

    /**
     * Only RDFE entities have a URL property. We need to invent
     * one for ARM entities so we can use the current ID selection in
     * the drop down.
     */
    private _fudgeArmUrl(favorite: PinnableEntity) {
        return !favorite.url
            ? `https://${this._currentAccountEndpoint}${favorite.routerLink.join("/")}`
            : favorite.url;
    }

    private get _jsonFilename(): string {
        return `${this._currentAccountEndpoint}.${this._pinnedFavouritesJsonFileName}`;
    }
}
