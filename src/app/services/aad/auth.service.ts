import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { AccessToken, AccessTokenCache, ServerError } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/electron";
import { wrapMainObservable } from "@batch-flask/electron/utils";
import { NotificationService } from "@batch-flask/ui";
import { TenantDetails } from "app/models";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { AADResourceName } from "client/azure-environment";
import { AADService } from "client/core/aad";
import { AADUser } from "client/core/aad/auth/aad-user";
import { Constants } from "common";
import { Observable, from, throwError } from "rxjs";
import { catchError, publishReplay, refCount } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AuthService implements OnDestroy {
    public tenants: Observable<TenantDetails[]>;
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
        this.tenants = wrapMainObservable(this._aadService.tenants, zone).pipe(
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
        console.log(`\n\n[${key}] Token ${key in this._waitingPromises}`)
        if (key in this._waitingPromises) {
            console.log(`[${key}] Returning cached promise`);
            // return this._waitingPromises[key];
        }
        if (this.tokenCache.hasToken(tenantId, resource)) {
            const token = this.tokenCache.getToken(tenantId, resource);
            console.log(`[${key}] Cached token ${!token.expireInLess(Constants.AAD.refreshMargin)}`);

            if (!token.expireInLess(Constants.AAD.refreshMargin)) {
                // return token;
            }
        }

        const promise = this.remote.send(
            Constants.IpcEvent.AAD.accessTokenData, { tenantId, resource })
        .then((x) => {
            console.log(`[${key}] renderer
            Tenant: ${tenantId}
            Resource: ${resource}
            AccessToken:
                Tenant: ${x.tenantId}
                Resource: ${x.resource}
                Token: ...${x.access_token.substring(x.access_token.length - 6)}
            `);
            const token = new AccessToken({ ...x });
            this.tokenCache.storeToken(tenantId, resource, token);
            return token;
        }).catch((e) =>  {
            console.log(`[${key}] promise.reject`)
            console.warn(e);
            throw e;
        // }).finally(() => {
        //     console.log(`[${key}] promise.finally`);
        });
        this._waitingPromises[key] = promise;
        console.log(`[${key}] new promise`);
        return promise;
    }
}
