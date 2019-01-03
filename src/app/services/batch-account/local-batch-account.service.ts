import { Injectable, OnDestroy } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { LOCAL_BATCH_ACCOUNT_PREFIX, LocalBatchAccount } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { filter, flatMap, map, take } from "rxjs/operators";
import { LocalFileStorage } from "../local-file-storage.service";

export const LOCAL_BATCH_ACCOUNT_KEY = "local-batch-accounts";

/**
 * Service that handle loading, adding and updating local back accounts
 */
@Injectable({providedIn: "root"})
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

    public exists(id: string): Observable<boolean> {
        return this.accounts.pipe(
            take(1),
            map(accounts => accounts.find(x => x.id === id)),
            map(x => Boolean(x)),
        );
    }

    public getNameFromId(id: string): string {
        const regex = /https:\/\/([0-9a-zA-Z-]+)\.([0-9a-zA-Z-]+)\.batch\.azure\.com/;
        const match = regex.exec(id);

        if (!match) {
            return id.replace(LOCAL_BATCH_ACCOUNT_PREFIX, "");
        }

        return match[1];
    }

    public create(account: LocalBatchAccount): Observable<any> {
        return this.exists(account.id).pipe(
            flatMap((exists) => {
                if (exists) {
                    return throwError(new ServerError({
                        status: 400,
                        code: "AccountAlreadyExist",
                        statusText: "Account already exist",
                        message: "Batch account with this url already exists",
                    }));
                }
                const newAccounts = this._accounts.value.push(account);
                this._accounts.next(List(newAccounts));
                return this._save();
            }),
        );

    }

    public delete(id: string) {
        const newAccounts = this._accounts.value.filter(x => x.id !== id);
        this._accounts.next(List(newAccounts));
        return this._save();
    }

    private _save() {
        return this.localStorage.set(LOCAL_BATCH_ACCOUNT_KEY, this._accounts.value.toJS());
    }
}
