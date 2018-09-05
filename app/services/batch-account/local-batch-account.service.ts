import { Injectable, OnDestroy } from "@angular/core";
import { LocalBatchAccount } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { LocalFileStorage } from "../local-file-storage.service";

const LOCAL_BATCH_ACCOUNT_KEY = "local-batch-accounts";

/**
 * Service that handle loading, adding and updating local back accounts
 */
@Injectable()
export class LocalBatchAccountService implements OnDestroy {
    public accounts: Observable<List<LocalBatchAccount>>;
    private _accounts = new BehaviorSubject<List<LocalBatchAccount>>(null);

    constructor(private localStorage: LocalFileStorage) {
        this.accounts = this._accounts.pipe(filter(x => x !== null));
    }

    public ngOnDestroy() {
        this._accounts.complete();
    }

    public load() {
        return this.localStorage.get(LOCAL_BATCH_ACCOUNT_KEY).pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    const accounts = data.map(x => new LocalBatchAccount(x));
                    this._accounts.next(List(accounts));
                } else {
                    this._accounts.next(List([]));
                }
            }),
        );
    }

    public get(id: string): Observable<LocalBatchAccount> {
        return this.accounts.pipe(
            take(1),
            map(accounts => accounts.filter(x => x.id === id).first()),
        );
    }
}
