import { Injectable, OnDestroy } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";

import { NavigableRecord, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import {
    BatchAccount, BatchApplication, BlobContainer, Certificate, Job, JobSchedule, Pool,
} from "app/models";
import { map, share, switchMap, take, takeUntil } from "rxjs/operators";
import { BatchAccountService } from "../batch-account";
import { LocalFileStorage } from "../local-file-storage.service";

const pinnedTypeMap = new Map();
pinnedTypeMap.set(PinnedEntityType.Application, BatchApplication);
pinnedTypeMap.set(PinnedEntityType.Pool, Pool);
pinnedTypeMap.set(PinnedEntityType.Job, Job);
pinnedTypeMap.set(PinnedEntityType.JobSchedule, JobSchedule);
pinnedTypeMap.set(PinnedEntityType.Certificate, Certificate);
pinnedTypeMap.set(PinnedEntityType.StorageContainer, BlobContainer);

const filename = "data/pinned-entities";
@Injectable()
export class PinnedEntityService implements OnDestroy {
    public loaded: Observable<boolean>;

    /**
     * List of favourties for the currently selected Batch Account
     */
    public favorites: Observable<List<PinnableEntity>>;
    public _currentAccount: BatchAccount;

    private _favorites: BehaviorSubject<Map<string, Map<string, PinnableEntity>>> = new BehaviorSubject(new Map());
    private _loaded = new BehaviorSubject<boolean>(false);
    private _destroy = new Subject();

    constructor(
        private localFileStorage: LocalFileStorage,
        private accountService: BatchAccountService) {

        this.loaded = this._loaded.asObservable();
        this._loadInitialData();

        this.accountService.currentAccount.pipe(takeUntil(this._destroy)).subscribe((account) => {
            this._currentAccount = account;
        });
        this.favorites = combineLatest(this.accountService.currentAccount, this._favorites).pipe(
            takeUntil(this._destroy),
            map(([account, favorites]) => {
                const map = favorites.get(account.id);
                return List(map && map.values());
            }),
        );
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._favorites.complete();
        this._loaded.complete();
    }

    public pinFavorite(entity: NavigableRecord): Observable<any> {
        if (this.isFavorite(entity)) {
            return of(true);
        }

        const favourite: PinnableEntity = {
            id: entity.id,
            name: entity.name,
            routerLink: entity.routerLink,
            pinnableType: this.getEntityType(entity),
            url: entity.url,
        };

        return this.accountService.currentAccount.pipe(take(1),
            switchMap((account) => {
                const map = this._favorites.value;
                const perAccount = map.get(account.id) || new Map();
                perAccount.set(favourite.url, favourite);
                map.set(account.id, perAccount);
                this._favorites.next(map);
                return this._saveAccountFavorites();
            }),
        );
    }

    public unPinFavorite(entity: NavigableRecord | PinnableEntity) {
        if (!this.isFavorite(entity)) {
            return;
        }

        return this.accountService.currentAccount.pipe(take(1),
            switchMap((account) => {
                const map = this._favorites.value;
                if (map.has(account.id)) {
                    const perAccount = map.get(account.id);
                    perAccount.delete(entity.url);
                    this._favorites.next(map);
                }
                return this._saveAccountFavorites();
            }),
        );
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
        if (!this._currentAccount) { return false; }
        const favorites = this._favorites.value.get(this._currentAccount.id);
        if (!favorites) {return false; }
        return favorites.has(entity.url);
    }

    private _loadInitialData() {
        this._loaded.next(false);
        this._loadFavorites().subscribe((favorites) => {
            this._favorites.next(favorites);
            this._loaded.next(true);
        });
    }

    private _loadFavorites(): Observable<Map<string, Map<string, PinnableEntity>>> {
        return this.localFileStorage.get(filename).pipe(
            map((data) => {
                const map = new Map<string, Map<string, PinnableEntity>>();
                for (const [accountId, perAccountObj] of Object.entries(data)) {
                    const perAccountMap = new Map<string, PinnableEntity>(perAccountObj);
                    map.set(accountId, perAccountMap);
                }
                return map;
            }),
            share(),
        );
    }

    private _saveAccountFavorites(): Observable<any> {
        const map = {};
        for (const [accountId, perAccountMap] of this._favorites.value.entries()) {
            const perAccountObj = [...perAccountMap.entries()];
            map[accountId] =  perAccountObj;
        }
        return this.localFileStorage.set(filename, map);
    }
}
