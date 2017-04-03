import { Injectable } from "@angular/core";
import { StorageAccountSharedKeyOptions, StorageClientProxyFactory } from "client/api";
import { Observable } from "rxjs";

import { StorageKeys } from "app/models";
import { ResourceUtils } from "app/utils";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import { ElectronRemote } from "./electron";

export interface AutoStorageSettings {
    lastKeySync: Date;
    storageAccountId: string;
}

@Injectable()
export class StorageClientService {
    private _currentAccountId: string;
    private _storageClientFactory: StorageClientProxyFactory;
    private _autoStorageSettings: AutoStorageSettings;

    constructor(
        private accountService: AccountService,
        private arm: ArmHttpService,
        private remote: ElectronRemote) {

        this._storageClientFactory = remote.getStorageClientFactory();

        // TODO: this might need some tweaking, though it works currently
        this.accountService.currentAccount.subscribe((account) => {
            this._autoStorageSettings = account.properties && account.properties.autoStorage;
            this._currentAccountId = account.id;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw "No account currently selected ...";
        }

        if (!this._autoStorageSettings) {
            throw "No linked storage account configured for this Batch account.";
        }

        // TODO: want to store these keys in a cache as the request takes about a second or 2 each time.
        // can invalidate cache if _autoStorageSettings.lastKeySync is greater than the last time we got one.
        const url = `${this._autoStorageSettings.storageAccountId}/listkeys`;
        return this.arm.post(url, JSON.stringify({}))
            .map(response => new StorageKeys(response.json()))
            .cascade((keys) => {
                return Observable.of(this.getForSharedKey({
                    account: this.getStorageAccountName(this._autoStorageSettings.storageAccountId),
                    key: keys.primaryKey,
                }));
            });
    }

    public getForSharedKey(options: StorageAccountSharedKeyOptions) {
        return this._storageClientFactory.getBlobServiceForSharedKey(options);
    }

    public get hasAutoStorage(): boolean {
        return Boolean(this._autoStorageSettings);
    }

    private getStorageAccountName(storageAccountId: string): string {
        const accountName = ResourceUtils.getAccountNameFromResourceId(storageAccountId);
        if (!accountName) {
            throw "Unable to get account name from storage account id: " + storageAccountId;
        }

        return accountName;
    }
}
