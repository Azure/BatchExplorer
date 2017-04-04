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

export interface StorageKeyCachedItem {
    batchAccountId: string;
    storageAccountName: string;
    settings: AutoStorageSettings;
    keys: StorageKeys;
}

@Injectable()
export class StorageClientService {
    private _currentAccountId: string;
    private _storageClientFactory: StorageClientProxyFactory;
    private _autoStorageSettings: AutoStorageSettings;
    private _storageKeyMap: StringMap<StorageKeyCachedItem> = {};

    constructor(
        private accountService: AccountService,
        private arm: ArmHttpService,
        private remote: ElectronRemote) {

        this._storageClientFactory = remote.getStorageClientFactory();

        // TODO: this might need some tweaking, though it works currently
        this.accountService.currentAccount.subscribe((account) => {
            this._autoStorageSettings = account.properties && account.properties.autoStorage;
            this._currentAccountId = account.id;
            this._checkAndSetCachedItem();
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw "No account currently selected ...";
        } else if (!this._autoStorageSettings) {
            throw "No linked storage account configured for this Batch account.";
        } else if (!this._isCached(this._autoStorageSettings.storageAccountId)) {
            throw "Expected cached item for storage account: " + this._autoStorageSettings.storageAccountId;
        }

        // by the time we get here we know there is an entry in the cache
        // clone in case the settings get changed out from under us with the user changing accounts
        let settings = Object.assign({}, this._autoStorageSettings);
        let cachedItem = this._getCachedItem(settings.storageAccountId);

        // check if we have keys or if the lastKeySync date has changed
        if (Boolean(cachedItem.keys) && this._checkLastKeySync(cachedItem, settings)) {
            console.log("returning keys from cache");
            return Observable.of(this.getForSharedKey({
                account: cachedItem.storageAccountName,
                key: cachedItem.keys.primaryKey,
            }));
        } else {
            console.log("no keys, calling API /listkeys");
            const url = `${settings.storageAccountId}/listkeys`;
            return this.arm.post(url, JSON.stringify({}))
                .map(response => new StorageKeys(response.json()))
                .cascade((keys) => {
                    cachedItem.keys = keys;
                    return Observable.of(this.getForSharedKey({
                        account: cachedItem.storageAccountName,
                        key: keys.primaryKey,
                    }));
                });
        }
    }

    public getForSharedKey(options: StorageAccountSharedKeyOptions) {
        return this._storageClientFactory.getBlobServiceForSharedKey(options);
    }

    public get hasAutoStorage(): boolean {
        return Boolean(this._autoStorageSettings);
    }

    /**
     * Get the name of the storage account from the account id
     * @param [storageAccountId] the full resource id for the storage account.
     */
    private getStorageAccountName(storageAccountId: string): string {
        const accountName = ResourceUtils.getAccountNameFromResourceId(storageAccountId);
        if (!accountName) {
            throw "Unable to get account name from storage account id: " + storageAccountId;
        }

        return accountName;
    }

    /**
     * Set up an item in the localized cache for holding onto storage keys for
     * the life of the application.
     */
    private _checkAndSetCachedItem() {
        if (this._hasStorageAccountId() && !this._isCached(this._autoStorageSettings.storageAccountId)) {
            const storageAccountName = this.getStorageAccountName(this._autoStorageSettings.storageAccountId);
            this._storageKeyMap[this._autoStorageSettings.storageAccountId] = {
                batchAccountId: this._currentAccountId,
                storageAccountName: storageAccountName,
                settings: Object.assign({}, this._autoStorageSettings), // clone
                keys: null,
            };
        }
    }

    /**
     * check if settings.lastKeySync is greater than the one in the cache. If it is, return false
     * so that the keys are forced to reload.
     * @param [cachedItem] the key settings from the cache
     * @param [settings] the current account auto storage settings
     */
    private _checkLastKeySync(cachedItem: StorageKeyCachedItem, settings: AutoStorageSettings): boolean {
        console.log(`settings: ${settings.lastKeySync}, cached: ${cachedItem.settings.lastKeySync}`);
        if (settings.lastKeySync > cachedItem.settings.lastKeySync) {
            // update the lastKeySync value and return false so the keys are reloaded.
            this._storageKeyMap[settings.storageAccountId].settings.lastKeySync = settings.lastKeySync;
            console.log("lastKeySync has changed, updating and returning false");

            return false;
        }

        return true;
    }

    private _hasStorageAccountId(): boolean {
        return Boolean(this._autoStorageSettings) && Boolean(this._autoStorageSettings.storageAccountId);
    }

    private _isCached(storageAccountId: string): boolean {
        return Boolean(this._getCachedItem(storageAccountId));
    }

    private _getCachedItem(storageAccountId: string): StorageKeyCachedItem {
        return this._storageKeyMap[this._autoStorageSettings.storageAccountId];
    }
}
