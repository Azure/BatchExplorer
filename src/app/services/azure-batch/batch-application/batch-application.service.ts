import { Injectable, OnDestroy } from "@angular/core";
import {
    DataCache,
    EntityView,
    HttpCode,
    ListOptionsAttributes,
    ListView,
    ServerError,
} from "@batch-flask/core";
import { BatchApplication } from "app/models";
import { ArmHttpService } from "app/services/arm-http.service";
import { BatchAccountService } from "app/services/batch-account";
import {
    ArmEntityGetter,
    ArmListGetter,
} from "app/services/core";
import { Constants } from "common";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export interface ApplicationListParams {
}

export interface ApplicationParams {
    id?: string;
}

// List of error we don't want to log for storage requests
const applicationIgnoredErrors = [
    HttpCode.Conflict,
];

@Injectable({ providedIn: "root" })
export class BatchApplicationService implements OnDestroy {
    /**
     * Triggered when an application is added through this app.
     * Used to notify the list of a new item
     */
    public onApplicationAdded = new Subject<string>();

    private _currentAccountId: string;
    private _basicProperties: string = "id,displayName,allowUpdates,defaultVersion";
    private _cache = new DataCache<BatchApplication>();
    private _getter: ArmEntityGetter<BatchApplication, ApplicationParams>;
    private _listGetter: ArmListGetter<BatchApplication, ApplicationListParams>;
    private _destroy = new Subject();

    constructor(
        private arm: ArmHttpService,
        accountService: BatchAccountService) {

        accountService.currentAccountId.pipe(takeUntil(this._destroy)).subscribe((accountId) => {
            this._currentAccountId = accountId;
        });

        this._getter = new ArmEntityGetter(BatchApplication, this.arm, {
            cache: () => this._cache,
            uri: ({ id }) => id,
        });

        this._listGetter = new ArmListGetter(BatchApplication, this.arm, {
            cache: () => this._cache,
            uri: () => `${this._currentAccountId}/applications`,
            logIgnoreError: applicationIgnoredErrors,
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
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
     * Check if the ServerError is an auto storage error from the application service
     */
    public isAutoStorageError(error: ServerError): boolean {
        const badCode = Constants.APIErrorCodes.accountNotEnabledForAutoStorage;
        return error && error.code === badCode;
    }
}
