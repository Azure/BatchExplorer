import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { AccessToken, AccessTokenCache, ServerError } from "@batch-flask/core";
import { AADResourceName } from "@batch-flask/core/azure-environment";
import { ElectronRemote } from "@batch-flask/electron";
import { wrapMainObservable } from "@batch-flask/electron/utils";
import { NotificationService } from "@batch-flask/ui";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { AADService } from "client/core/aad";
import { AADUser } from "client/core/aad/adal/aad-user";
import { Constants } from "common";
import { Observable, from, throwError } from "rxjs";
import { catchError, publishReplay, refCount } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AdalService implements OnDestroy {
    public tenantsIds: Observable<string[]>;
    public currentUser: Observable<AADUser>;

    private _aadService: AADService;
    private tokenCache = new AccessTokenCache();
    private _waitingPromises: StringMap<Promise<AccessToken>> = {};

    constructor(
        zone: NgZone,
        batchExplorer: BatchExplorerService,
        private remote: ElectronRemote,
        private notificationService: NotificationService) {
        this._aadService = batchExplorer.aadService;

        this.currentUser = wrapMainObservable(this._aadService.currentUser, zone);
        this.tenantsIds = wrapMainObservable(this._aadService.tenantsIds, zone).pipe(
            catchError((error) => {
                const serverError = new ServerError(error);
                this.notificationService.error(
                    `Error loading tenants. This could be an issue with proxy settings or your connection.`,
                    serverError.toString());
                return throwError(serverError);
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public ngOnDestroy() {
        // Nothing to do
    }

    public logout() {
        this._aadService.logout();
        this._waitingPromises = {};
    }

    public accessTokenFor(tenantId: string, resource: AADResourceName = null) {
        return from(this.accessTokenDataAsync(tenantId, resource).then(x => x.access_token));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public accessTokenData(tenantId: string, resource: AADResourceName = null): Observable<AccessToken> {
        return from(this.accessTokenDataAsync(tenantId, resource));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public async accessTokenDataAsync(tenantId: string, resource: AADResourceName = null): Promise<AccessToken> {
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
