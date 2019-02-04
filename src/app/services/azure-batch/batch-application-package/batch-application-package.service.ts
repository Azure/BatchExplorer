import { Injectable } from "@angular/core";
import {
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListView,
} from "@batch-flask/core";
import { BatchApplicationPackage, BatchApplicationPackageAttributes } from "app/models";
import { ArmHttpService } from "app/services/arm-http.service";
import { BatchAccountService } from "app/services/batch-account";
import {
    ArmEntityGetter,
    ArmListGetter,
} from "app/services/core";
import { Constants } from "common";
import { Observable, Subject } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";

export interface BatchApplicationPackageListParams {
    applicationId: string;
}

export interface BatchApplicationPackageParams {
    id?: string;
}

@Injectable({ providedIn: "root" })
export class BatchApplicationPackageService {
    /**
     * Triggered when an application is added through this app.
     * Used to notify the list of a new item
     */
    public onPackageAdded = new Subject<string>();

    private _basicProperties: string = "id,displayName,allowUpdates,defaultVersion";
    private _cache = new DataCache<BatchApplicationPackage>();
    private _getter: ArmEntityGetter<BatchApplicationPackage, BatchApplicationPackageParams>;
    private _listGetter: ArmListGetter<BatchApplicationPackage, BatchApplicationPackageListParams>;

    constructor(
        private arm: ArmHttpService,
        private accountService: BatchAccountService) {

        this._getter = new ArmEntityGetter(BatchApplicationPackage, this.arm, {
            cache: () => this._cache,
            uri: ({ id }) => id,
        });

        this._listGetter = new ArmListGetter(BatchApplicationPackage, this.arm, {
            cache: () => this._cache,
            uri: ({ applicationId }) => `${applicationId}/versions`,
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public listView(options: ListOptionsAttributes = {})
        : ListView<BatchApplicationPackage, BatchApplicationPackageListParams> {

        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public list(applicationId: string, options?: ListOptionsAttributes) {
        return this._listGetter.fetch({ applicationId }, options);
    }

    public listAll(applicationId: string, options?: ListOptionsAttributes) {
        return this._listGetter.fetchAll({ applicationId }, options);
    }

    public get(packageId: string, options: any = {}): Observable<BatchApplicationPackage> {
        return this._getter.fetch({ id: packageId });
    }

    public getFromCache(packageId: string, options: any = {}): Observable<BatchApplicationPackage> {
        return this._getter.fetch({ id: packageId }, { cached: true });
    }

    /**
     * Create an entity view for a pool
     */
    public view(): EntityView<BatchApplicationPackage, BatchApplicationPackageParams> {
        return new EntityView({
            cache: () => this._cache,
            getter: this._getter,
            poll: Constants.PollRate.batchApplication,
        });
    }

    /**
     * Creates an application package record.
     * @param name: id of the application
     * @param version: selected package version name
     */
    public put(name: string, version: string): Observable<BatchApplicationPackage> {
        return this.accountService.currentAccountId
            .pipe(
                take(1),
                switchMap((accountId: string) => {
                    return this.arm.put<BatchApplicationPackageAttributes>(
                        `${accountId}/applications/${name}/versions/${version}`);
                }),
                map(response => new BatchApplicationPackage(response)),
            );
    }

    /**
     * Deletes an application.
     * @param applicationId: id of the application
     */
    public delete(packageId: string): Observable<any> {
        return this.arm.delete(packageId);
    }

    /**
     * Activates the specified application package.
     * Note: This is just a backup in case the automatic activation fails for whatever
     * reason, leaving the package in an inconsistent state.
     * @param applicationId: id of the application
     * @param version: selected package version
     */
    public activate(packageId: string): Observable<any> {
        return this.arm.post(`${packageId}/activate`, {
            format: "zip",
        });
    }
}
