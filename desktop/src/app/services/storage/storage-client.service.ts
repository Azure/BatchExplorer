import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { StorageKeys } from "app/models";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { ArmResourceUtils } from "app/utils";
import { Observable, throwError } from "rxjs";
import { first, flatMap, map, share } from "rxjs/operators";
import { BatchAccountService } from "../batch-account";
import { BlobStorageClientProxy } from "./blob-storage-client-proxy";
import { StorageAccountKeysService } from "./storage-account-keys.service";
import { StorageClientProxyFactory } from "./storage-client-proxy-factory";

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

@Injectable({providedIn: "root"})
export class StorageClientService {
    public hasAutoStorage: Observable<boolean>;
    public hasArmAutoStorage: Observable<boolean>;

    private _storageClientFactory: StorageClientProxyFactory;
    private _sharedKeyMap = new Map<string, any>();

    constructor(
        private batchExplorer: BatchExplorerService,
        private accountService: BatchAccountService,
        private storageKeysService: StorageAccountKeysService) {

        this._storageClientFactory = new StorageClientProxyFactory();

        this.hasAutoStorage = this.accountService.currentAccount.pipe(map((account) => {
            return Boolean(account.autoStorage);
        }));

        this.hasArmAutoStorage = this.accountService.currentAccount.pipe(map((account) => {
            return account.hasArmAutoStorage();
        }));
    }

    public getAutoStorage(): Observable<any> {
        return this.accountService.currentAccount.pipe(
            first(),
            flatMap((account) => {
                const settings = account.autoStorage;
                if (!settings) {
                    return throwError(new ServerError({
                        status: 404,
                        code: "AutostorageNotSetup",
                        message: "Autostorage not setup for this account",
                    }));
                }
                return this.getFor(settings.storageAccountId);
            }),
            share(),
        );
    }

    public getFor(storageAccountId: string): Observable<BlobStorageClientProxy> {
        return this.storageKeysService.getFor(storageAccountId).pipe(map((keys) => {
            return this._storageClientFactory.getBlobServiceForSharedKey({
                account: ArmResourceUtils.getAccountNameFromResourceId(storageAccountId),
                key: keys.primaryKey,
                endpoint: this.batchExplorer.azureEnvironment.storageEndpoint,
            });
        }));
    }

    public clearCurrentStorageKeys() {
        this._sharedKeyMap.clear();
    }
}
