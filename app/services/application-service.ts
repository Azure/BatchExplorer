import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Application, ApplicationPackage } from "app/models";
import { AccountService } from "app/services";
import { AzureHttpService } from "./azure-http.service";
import { DataCache, RxArmEntityProxy, RxArmListProxy, RxEntityProxy, RxListProxy } from "./core";

export interface ApplicationListParams {
}

export interface ApplicationParams {
    id?: string;
}

@Injectable()
export class ApplicationService {
    /**
     * Triggered when an application is added through this app.
     * Used to notify the list of a new item
     */
    public onApplicationAdded = new Subject<string>();

    /**
     * Triggered when a new version is added to an application.
     * Used to notify the list of a new item
     */
    public onPackageVersionAdded = new Subject<string>();

    private _currentAccountId: string;
    private _basicProperties: string = "id,displayName,allowUpdates,defaultVersion";
    private _cache = new DataCache<Application>();

    constructor(
        private azure: AzureHttpService,
        private accountService: AccountService) {

        accountService.currentAccountId.subscribe((accountId) => {
            this._currentAccountId = accountId;
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
            uri: () => `${this._currentAccountId}/applications`,
            initialOptions: initialOptions,
        });
    }

    /**
     * Get the selected account
     */
    public get(applicationId: string, options: any = {}): RxEntityProxy<ApplicationParams, Application> {
        return new RxArmEntityProxy<ApplicationParams, Application>(Application, this.azure, {
            cache: () => this._cache,
            uri: ({ id}) => `${this._currentAccountId}/applications/${id}`,
            initialParams: {
                id: applicationId,
            },
        });
    }

    public put(applicationId: string, version: string): Observable<ApplicationPackage> {
        return this.azure
            .put(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`)
            .map(response => new ApplicationPackage(response.json()));
    }

    public activate(applicationId: string, version: string): Observable<any> {
        return this.azure.post(
            `${this._currentAccountId}/applications/${applicationId}/versions/${version}/activate`,
            {
                format: "zip",
            });
    }

    /**
     * Once delete has completed we call this to remove it from the cache
     */
    public notifyApplicationDeleted(applicationId: string) {
        this._cache.deleteItemByKey(applicationId);
    }
}
