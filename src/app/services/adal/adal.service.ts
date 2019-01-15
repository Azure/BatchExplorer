import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { AccessToken, AccessTokenCache, ServerError, isNotNullOrUndefined } from "@batch-flask/core";
import { ElectronRemote, NotificationService } from "@batch-flask/ui";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { AADService } from "client/core/aad";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";
import { BehaviorSubject, Observable, Subscription, from } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AdalService implements OnDestroy {
    public tenantsIds: Observable<string[]>;
    public currentUser: Observable<AADUser>;

    private aadService: AADService;
    private tokenCache = new AccessTokenCache();
    private _waitingPromises: StringMap<Promise<AccessToken>> = {};
    private _currentUser = new BehaviorSubject<AADUser>(null);
    private _tenantsIds = new BehaviorSubject<string[]>([]);
    private _subs: Subscription[] = [];

    constructor(
        private zone: NgZone,
        private remote: ElectronRemote,
        batchExplorer: BatchExplorerService,
        private notificationService: NotificationService) {
        this.currentUser = this._currentUser.pipe(filter(isNotNullOrUndefined));
        this.tenantsIds = this._tenantsIds.asObservable();

        this.aadService = batchExplorer.aadService;

        this._subs.push(this.aadService.currentUser.subscribe((value) => {
            this._currentUser.next(value);
        }));

        // Need to do this as aadService.tenantIds is in the node processs and electron lose information in the transfer
        this._subs.push(this.aadService.tenantsIds.subscribe({
            next: (val) => {
                this.zone.run(() => {
                    this._tenantsIds.next(val);
                });
            },
            error: (error) => {
                const serverError = new ServerError(error);
                this._tenantsIds.error(serverError);
                this.notificationService.error(
                    `Error loading tenants. This could be an issue with proxy settings or your connection.`,
                    serverError.toString());
            },
        }));
    }

    public ngOnDestroy() {
        this._tenantsIds.complete();
        this._currentUser.complete();
        this._subs.forEach(x => x.unsubscribe());

    }

    public logout() {
        this.aadService.logout();
        this._waitingPromises = {};
    }

    public accessTokenFor(tenantId: string, resource: string = null) {
        return from(this.accessTokenDataAsync(tenantId, resource).then(x => x.access_token));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public accessTokenData(tenantId: string, resource: string = null): Observable<AccessToken> {
        return from(this.accessTokenDataAsync(tenantId, resource));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public async accessTokenDataAsync(tenantId: string, resource: string = null): Promise<AccessToken> {
        const key = `${tenantId}/${resource}`;
        if (key in this._waitingPromises) {
            return this._waitingPromises[key];
        }
        if (this.tokenCache.hasToken(tenantId, resource)) {
            const token = this.tokenCache.getToken(tenantId, resource);

            if (!token.expireInLess(Constants.AAD.refreshMargin)) {
                return token;
            }
        }

        const promise = this.remote.send(Constants.IpcEvent.AAD.accessTokenData, { tenantId, resource }).then((x) => {
            const token = new AccessToken({ ...x });
            this.tokenCache.storeToken(tenantId, resource, token);
            delete this._waitingPromises[key];
            return token;
        });
        this._waitingPromises[key] = promise;
        return promise;
    }
}
