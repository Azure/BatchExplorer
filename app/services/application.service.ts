import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { HttpCode, ServerError } from "@batch-flask/core";
import { ApplicationPackage, BatchApplication } from "app/models";
import { Constants } from "app/utils";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import {
    ArmEntityGetter, ArmListGetter, DataCache, EntityView, ListOptionsAttributes, ListView,
} from "./core";
import { ServiceBase } from "./service-base";

export interface ApplicationListParams {
}

export interface ApplicationParams {
    id?: string;
}

// List of error we don't want to log for storage requests
const applicationIgnoredErrors = [
    HttpCode.Conflict,
];

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
    private _cache = new DataCache<BatchApplication>();
    private _getter: ArmEntityGetter<BatchApplication, ApplicationParams>;
    private _listGetter: ArmListGetter<BatchApplication, ApplicationListParams>;

    constructor(
        private arm: ArmHttpService,
        accountService: AccountService) {

        super();
        accountService.currentAccountId.subscribe((accountId) => {
            this._currentAccountId = accountId;
        });

        this._getter = new ArmEntityGetter(BatchApplication, this.arm, {
            cache: () => this._cache,
            uri: ({ id }) => `${this._currentAccountId}/applications/${id}`,
        });

        this._listGetter = new ArmListGetter(BatchApplication, this.arm, {
            cache: () => this._cache,
            uri: () => `${this._currentAccountId}/applications2`,
            logIgnoreError: applicationIgnoredErrors,
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public listView(options: ListOptionsAttributes = {}): ListView<BatchApplication, ApplicationListParams> {
        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public list(options?: ListOptionsAttributes) {
        return this._listGetter.fetch(options);
    }

    public listAll(options?: ListOptionsAttributes) {
        return this._listGetter.fetchAll(options);
    }

    public get(applicationId: string, options: any = {}): Observable<BatchApplication> {
        return this._getter.fetch({ id: applicationId });
    }

    public getFromCache(applicationId: string, options: any = {}): Observable<BatchApplication> {
        return this._getter.fetch({ id: applicationId }, { cached: true });
    }

    /**
     * Create an entity view for a pool
     */
    public view(): EntityView<BatchApplication, ApplicationParams> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
            poll: Constants.PollRate.batchApplication,
        });
    }

    /**
     * Creates an application package record.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public put(applicationId: string, version: string): Observable<ApplicationPackage> {
        return this.arm
            .put(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`)
            .map(response => new ApplicationPackage(response.json()));
    }

    /**
     * Updates settings for the specified application.
     * @param application: application to patch to the current state
     * @param jsonData: json data containing the application patch data
     */
    public patch(applicationId: string, jsonData: any): Observable<any> {
        return this.arm.patch(
            `${this._currentAccountId}/applications/${applicationId}`,
            {
                allowUpdates: jsonData.allowUpdates,
                defaultVersion: jsonData.defaultVersion,
                displayName: jsonData.displayName,
            },
        );
    }

    /**
     * Deletes an application.
     * @param applicationId: id of the application
     */
    public delete(applicationId: string): Observable<any> {
        return this.arm.delete(`${this._currentAccountId}/applications/${applicationId}`);
    }

    /**
     * Activates the specified application package.
     * Note: This is just a backup in case the automatic activation fails for whatever
     * reason, leaving the package in an inconsistent state.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public activatePackage(applicationId: string, version: string): Observable<any> {
        return this.arm.post(
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
        return this.arm
            .get(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`)
            .map(response => new ApplicationPackage(response.json()));
    }

    /**
     * Deletes an application package record and its associated binary file.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public deletePackage(applicationId: string, version: string): Observable<any> {
        return this.arm.delete(`${this._currentAccountId}/applications/${applicationId}/versions/${version}`);
    }

    /**
     * Check if the ServerError is an auto storage error from the application service
     */
    public isAutoStorageError(error: ServerError): boolean {
        const badCode = Constants.APIErrorCodes.accountNotEnabledForAutoStorage;
        return error && error.code === badCode;
    }
}
