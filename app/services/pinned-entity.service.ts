import { Injectable } from "@angular/core";
import { List } from "immutable";
import { AsyncSubject, BehaviorSubject, Observable, of } from "rxjs";

import { NavigableRecord, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import {
    BatchApplication, BlobContainer, Certificate, Job, JobSchedule, Pool,
} from "app/models";
import { map, share } from "rxjs/operators";
import { BatchAccountService } from "./batch-account.service";
import { LocalFileStorage } from "./local-file-storage.service";

const pinnedTypeMap = new Map();
pinnedTypeMap.set(PinnedEntityType.Application, BatchApplication);
pinnedTypeMap.set(PinnedEntityType.Pool, Pool);
pinnedTypeMap.set(PinnedEntityType.Job, Job);
pinnedTypeMap.set(PinnedEntityType.JobSchedule, JobSchedule);
pinnedTypeMap.set(PinnedEntityType.Certificate, Certificate);
pinnedTypeMap.set(PinnedEntityType.StorageContainer, BlobContainer);

@Injectable()
export class PinnedEntityService {
    public loaded: Observable<boolean>;
    public favourites: Observable<List<PinnableEntity>>;

    private _pinnedFavouritesJsonFileName: string = "pinned";
    private _favorites: BehaviorSubject<List<PinnableEntity>> = new BehaviorSubject(List([]));
    private _loaded = new BehaviorSubject<boolean>(false);
    private _currentAccountEndpoint: string = "";

    constructor(
        private localFileStorage: LocalFileStorage,
        private accountService: BatchAccountService) {

        this.loaded = this._loaded.asObservable();
        this.accountService.currentAccount.subscribe((account) => {
            this._currentAccountEndpoint = account.url;
            this._favorites.next(List<PinnableEntity>());
            this._loadInitialData();
        });
    }

    public get favorites(): Observable<List<PinnableEntity>> {
        return this._favorites.asObservable();
    }

    public pinFavorite(entity: NavigableRecord): Observable<any> {
        if (this.isFavorite(entity)) {
            return of(true);
        }

        const subject = new AsyncSubject();
        const favourite: PinnableEntity = {
            id: entity.id,
            name: entity.name,
            routerLink: entity.routerLink,
            pinnableType: this.getEntityType(entity),
            url: this._fudgeArmUrl(entity),
        };

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

    public unPinFavorite(entity: NavigableRecord | PinnableEntity) {
        if (!this.isFavorite(entity)) {
            return;
        }

        const url = this._fudgeArmUrl(entity);
        const newFavorites = this._favorites.getValue().filter(pinned => pinned.url !== url);
        this._favorites.next(List<PinnableEntity>(newFavorites));
        this._saveAccountFavorites();
    }

    public getEntityType(entity: NavigableRecord | PinnableEntity): PinnedEntityType {
        for (const [type, cls] of pinnedTypeMap) {
            if (entity instanceof cls) {
                return type as any;
            }
        }

        /* fallback, casting pinnable as a PinnableEntity */
        const pinnable = entity as PinnableEntity;
        return pinnable ? pinnable.pinnableType : null;
    }

    public isFavorite(entity: NavigableRecord | PinnableEntity): boolean {
        const id = entity.id.toLowerCase();
        const favorites = this._favorites.getValue();
        const entityType = this.getEntityType(entity);
        if (!entityType) { return false; }

        const found = favorites.filter((pinned) => {
            return pinned.id.toLowerCase() === id && pinned.pinnableType === entityType;
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

    private _loadFavorites(): Observable<List<PinnableEntity>> {
        return this.localFileStorage.get(this._jsonFilename).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return List(data);
                } else {
                    return List([]);
                }
            }),
            share(),
        );
    }

    private _saveAccountFavorites(favourites: List<PinnableEntity> = null): Observable<any> {
        favourites = favourites === null ? this._favorites.getValue() : favourites;
        return this.localFileStorage.set(this._jsonFilename, favourites.toJS());
    }

    /**
     * Only RDFE entities have a URL property. We need to invent
     * one for ARM entities so we can use the current ID selection in
     * the drop down.
     */
    private _fudgeArmUrl(favorite: NavigableRecord) {
        return !favorite.url
            ? `https://${this._currentAccountEndpoint}${favorite.routerLink.join("/")}`
            : favorite.url;
    }

    private get _jsonFilename(): string {
        return `${this._currentAccountEndpoint}.${this._pinnedFavouritesJsonFileName}`;
    }
}
