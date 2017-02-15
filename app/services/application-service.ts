import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Application, ApplicationPackage } from "app/models";
import { AccountService } from "app/services";
import { AzureHttpService } from "./azure-http.service";
import { DataCache, RxArmEntityProxy, RxArmListProxy, RxEntityProxy, RxListProxy, getOnceProxy } from "./core";
import { ServiceBase } from "./service-base";

export interface ApplicationListParams {
}

export interface ApplicationParams {
    id?: string;
}

@Injectable()
export class ApplicationService extends ServiceBase {
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

        super();
        accountService.currentAccountId.subscribe((accountId) => {
            this._currentAccountId = accountId;
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    /**
     * Lists all of the applications in the specified account.
     * @param initialOptions: options for the list query
     */
    public list(initialOptions: any = {}): RxListProxy<ApplicationListParams, Application> {
        return new RxArmListProxy<ApplicationListParams, Application>(Application, this.azure, {
            cache: (params) => this._cache,
            uri: () => `${this._currentAccountId}/applications`,
            initialOptions: initialOptions,
        });
    }

    /**
     * Gets information about the specified application, including
     * a list of it's packages.
     * @param applicationId: id of the application
     */
    public get(applicationId: string): RxEntityProxy<ApplicationParams, Application> {
        return new RxArmEntityProxy<ApplicationParams, Application>(Application, this.azure, {
            cache: () => this._cache,
            uri: ({ id}) => `${this._currentAccountId}/applications/${id}`,
            initialParams: {
                id: applicationId,
            },
        });
    }

    public getOnce(applicationId: string, options: any = {}): Observable<Application> {
        return getOnceProxy(this.get(applicationId));
    }

    /**
     * Creates an application package record.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public put(applicationId: string, version: string): Observable<ApplicationPackage> {
        return this.azure
            .put(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`)
            .map(response => new ApplicationPackage(response.json()));
    }

    /**
     * Deletes an application.
     * @param applicationId: id of the application
     */
    public delete(applicationId: string): Observable<any> {
        return this.azure.delete(`${this._currentAccountId}/applications/${applicationId}`);
    }

    /**
     * Activates the specified application package.
     * Note: This is just a backup in case the automatic activation fails for whatever
     * reason, leaving the package in an inconsistent state.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public activatePackage(applicationId: string, version: string): Observable<any> {
        return this.azure.post(
            `${this._currentAccountId}/applications/${applicationId}/versions/${version}/activate`,
            {
                format: "zip",
            },
        );
    }

    /**
     * Gets information about the specified application package.
     * TODO: Returns an Observable so won't work with delete poller.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public getPackage(applicationId: string, version: string): Observable<ApplicationPackage> {
        return this.azure
            .get(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`)
            .map(response => new ApplicationPackage(response.json()));
    }

    /**
     * Deletes an application package record and its associated binary file.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public deletePackage(applicationId: string, version: string): Observable<any> {
        return this.azure.delete(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`);
    }
}
