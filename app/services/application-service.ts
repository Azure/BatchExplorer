import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { AccountResource, Application } from "app/models";
import { AccountService } from "app/services";
import { AzureHttpService } from "./azure-http.service";
import { DataCache, RxArmEntityProxy, RxArmListProxy, RxEntityProxy, RxListProxy } from "./core";

export interface ApplicationListParams {
    batchAccountId: string;
}

export interface ApplicationParams {
    batchAccountId: string;
    id?: string;
}

@Injectable()
export class ApplicationService {
    /**
     * Triggered only when an application is added through this app.
     * Used to notify the list of a new item
     */
    public onApplicationAdded = new Subject<string>();

    private _currentAccount: AccountResource;
    private _basicProperties: string = "id,displayName,allowUpdates,defaultVersion";
    private _cache = new DataCache<Application>();

    constructor(
        private azure: AzureHttpService,
        private accountService: AccountService) {

        accountService.currentAccount.subscribe((account) => {
            console.log("setting current account :: ", account);
            this._currentAccount = account;
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    /**
     * List applications for the currently selected account
     */
    public list(initialOptions: any = {}): RxListProxy<ApplicationListParams, Application> {
        return new RxArmListProxy<ApplicationListParams, Application>(Application, this.azure, {
            cache: (params) => this._cache,
            uri: ({ batchAccountId }) => `${batchAccountId}/applications`,
            initialParams: { batchAccountId: this._currentAccount.id },
            initialOptions: initialOptions,
        });
    }

    /**
     * Get the selected account
     */
    public get(applicationId: string, options: any = {}): RxEntityProxy<ApplicationParams, Application> {
        return new RxArmEntityProxy<ApplicationParams, Application>(Application, this.azure, {
            cache: () => this._cache,
            uri: ({batchAccountId, id}) => `${batchAccountId}/applications/${id}`,
            initialParams: {
                batchAccountId: this._currentAccount.id,
                id: applicationId,
            },
        });
    }

    /**
     * Once delete has completed we call this to remove it from the cache
     */
    public notifyApplicationDeleted(applicationId: string) {
        this._cache.deleteItemByKey(applicationId);
    }
}
