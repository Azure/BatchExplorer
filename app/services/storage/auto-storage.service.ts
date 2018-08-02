import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AccountService } from "app/services/account.service";

export type StorageDataSource = string | "file-groups";

@Injectable()
export class AutoStorageService {
    public storageAccountId: Observable<string>;
    public hasArmAutoStorage: Observable<boolean>;
    public hasAutoStorage: Observable<boolean>;

    constructor(private accountService: AccountService) {
        this.storageAccountId = this.accountService.currentAccount.map((account) => {
            return account.autoStorage && account.autoStorage.storageAccountId;
        });

        this.hasAutoStorage = this.accountService.currentAccount.map((account) => {
            return Boolean(account.autoStorage);
        });

        this.hasArmAutoStorage = this.accountService.currentAccount.map((account) => {
            return account.hasArmAutoStorage();
        });
    }

    public get(): Observable<string> {
        return this.storageAccountId.take(1);
    }

    public getStorageAccountIdFromDataSource(dataSource: StorageDataSource): Observable<string> {
        if (!dataSource) { return of(dataSource); }
        if (dataSource === "file-groups") {
            return this.get();
        } else {
            return of(dataSource);
        }
    }
}
