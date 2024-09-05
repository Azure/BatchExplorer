import { EventEmitter, Injectable, NgZone, OnDestroy } from "@angular/core";
import { AccessToken, AccessTokenCache, AuthEvent, I18nService, ServerError, TenantSettings } from "@batch-flask/core";
import { TenantSettingsService } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/electron";
import { wrapMainObservable } from "@batch-flask/electron/utils";
import { NotificationService } from "@batch-flask/ui";
import { TenantDetails } from "app/models";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { AADResourceName } from "client/azure-environment";
import { AADService } from "client/core/aad";
import { AADUser } from "client/core/aad/auth/aad-user";
import { Constants } from "common";
import { Observable, from, throwError, combineLatest, forkJoin, of } from "rxjs";
import { catchError, map, publishReplay, refCount, share, switchMap } from "rxjs/operators";
import { TenantErrorService } from "./tenant-error.service";
import { IpcEvent } from "common/constants";

export const reauthenticateAll = "*";

export enum TenantStatus {
    authorized = "authorized",
    failed = "failed",
    unknown = "unknown"
}

export interface TenantAuthorization {
    tenant: TenantDetails;
    status: TenantStatus;
    active: boolean;
    message?: string;
    messageDetails?: string;
}

export type AuthEventType = "AuthSelect" | "AuthSelectResult" | "AuthComplete" |
    "Logout";

type TenantAuthRequestOptions = {
    notifyOnError?: boolean;
    reauthenticate?: string; // "*" or tenantId
};

export interface AuthSelectResult {
    result: "success" | "cancel";
    requestId?: string;
    externalBrowserAuth?: boolean;
}

export interface AuthSelectRequest {
    tenantId?: string;
    requestId?: string;
}

@Injectable({ providedIn: "root" })
export class AuthService implements OnDestroy {
    public tenants: Observable<TenantDetails[]>;
    public currentUser: Observable<AADUser>;

    private _aadService: AADService;
    private tokenCache = new AccessTokenCache();

    private previousTenantState: StringMap<TenantAuthorization> = {};
    private tokenObservableCache: StringMap<Observable<any>> = {};

    private authEvents = new Map<AuthEventType, EventEmitter<unknown>>();

    constructor(
        zone: NgZone,
        batchExplorer: BatchExplorerService,
        private remote: ElectronRemote,
        private notificationService: NotificationService,
        private tenantSettingsService: TenantSettingsService,
        private i18n: I18nService,
        private tenantErrorService: TenantErrorService
    ) {
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
        this.initializeEventEmitters();
    }

    public ngOnDestroy() {
        this.authEvents.forEach((event) => event.unsubscribe());
    }

    public async logout() {
        await this.remote.send(IpcEvent.logout);
        await this.tokenCache.clear();
        this.authEvents["Logout"].emit();
        return;
    }

    public async login() {
        return this.remote.send(IpcEvent.login);
    }

    public isLoggedIn(): Observable<boolean> {
        return this.currentUser.pipe(
            map(user => !!user),
            catchError(() => of(false))
        );
    }

    /* Only used by Python-RPC */
    public accessTokenFor(tenantId: string, resource: AADResourceName = null) {
        return this.accessTokenData(tenantId, resource)
            .pipe(map((x: AccessToken) => x.accessToken));
    }

    public getTenantAuthorizations(authOptions: TenantAuthRequestOptions = {
        notifyOnError: true
    }) {
        return combineLatest([
            this.tenants,
            this.tenantSettingsService.current,
        ]).pipe(
            map(([tenants, settings]: [TenantDetails[], TenantSettings]) => {
                return tenants.map((tenant: TenantDetails) => ({
                    tenant,

                    // A tenant is active if it is the home tenant or if it is
                    // explicitly set to active in the settings.
                    active: tenant.homeTenantId === tenant.tenantId ||
                        settings[tenant.tenantId] === "active",
                    status: TenantStatus.unknown
                } as TenantAuthorization));
            }),
            switchMap(authorizations => forkJoin(authorizations.map(
                authorization =>
                    this.authorizeTenant(authorization, authOptions)
            ))),
            share()
        );
    }

    private authorizeTenant(
        authorization: TenantAuthorization,
        { notifyOnError, reauthenticate }: TenantAuthRequestOptions
    ): Observable<TenantAuthorization> {
        const { tenantId } = authorization.tenant;
        const previousAuth = this.previousTenantState[tenantId];
        if (!authorization.active) {
            if (previousAuth) {
                // If the tenant was previously active, retain its state
                // instead of reinitializing it
                authorization = { ...previousAuth, active: false };
            } else {
                authorization.status = TenantStatus.unknown;
                authorization.message =
                    this.i18n.t('auth-service.activate-tenant');
            }
            return this.cacheAuthorization(authorization);
        } else {
            const forceRefresh =
                [reauthenticateAll, tenantId].includes(reauthenticate);

            if (forceRefresh) {
                this.tokenCache.removeToken(tenantId);
            }

            if (previousAuth?.status === TenantStatus.failed &&
                reauthenticate !== tenantId) {
                /* Skip previously failed tenant authorizations unless
                 * explicitly reauthenticating the tenant itself.
                 *
                 * NOTE: This skips previously-failed tenants when
                 * reauthentication is requested for all tenants. This is to
                 * avoid new interactive dialogs when refreshing all tenants.
                 */
                return of(previousAuth);
            }

            return this.accessTokenData(tenantId, null, forceRefresh).pipe(
                switchMap(token => {
                    if (token?.accessToken) {
                        authorization.status = TenantStatus.authorized;
                    }
                    return this.cacheAuthorization(authorization);
                }),
                catchError(error => {
                    authorization.status = TenantStatus.failed;
                    authorization.message =
                        this.i18n.t("auth-service.tenant-error", {
                            tenantName: authorization.tenant.displayName
                        });
                    authorization.messageDetails = error.description;
                    if (notifyOnError) {
                        this.tenantErrorService.showError(authorization);
                    }
                    return this.cacheAuthorization(authorization);
                })
            );
        }
    }

    /**
     * Fetches an access token from the main thread.
     *
     * @param tenantId the tenant ID
     * @param resource the resource ID
     * @param forceRefresh whether to force access token refresh
     */
    public accessTokenData(
        tenantId: string, resource: AADResourceName = null, forceRefresh = false
    ): Observable<AccessToken> {
        const key = [tenantId, resource].join("|");
        if (key in this.tokenObservableCache) {
            if (forceRefresh) {
                delete this.tokenObservableCache[key];
            } else {
                return this.tokenObservableCache[key];
            }
        }
        if (this.tokenCache.hasToken(tenantId, resource)) {
            const token = this.tokenCache.getToken(tenantId, resource);

            if (!token.expireInLess(Constants.AAD.refreshMargin)) {
                return of(token);
            }
        }

        const promise: Promise<AccessToken | AuthEvent> = this.remote.send(
            Constants.IpcEvent.AAD.accessTokenData,
            { tenantId, resource, forceRefresh }
        );
        promise.then((_) => this.authEvents["AuthComplete"].emit());
        const tokenObservable = from(promise).pipe(
            map((tokenData: AccessToken | AuthEvent) => {
                if (isAuthEvent(tokenData)) {
                    throw new AuthFlowException(tokenData);
                }
                const token = new AccessToken({ ...tokenData });
                this.tokenCache.storeToken(tenantId, resource, token);
                delete this.tokenObservableCache[key];
                return token;
            }),
            catchError(error => {
                delete this.tokenObservableCache[key];
                if (!(error instanceof AuthFlowException)) {
                    return throwError(error);
                }
            })
        );
        this.tokenObservableCache[key] = tokenObservable;
        return tokenObservable;
    }

    public getAccessToken(
        tenantId: string,
        resourceName: AADResourceName = null,
        forceRefresh = false
    ): Promise<AccessToken> {
        return this.accessTokenData(tenantId, resourceName, forceRefresh)
            .toPromise();
    }

    public showAuthSelect(data) {
        this.authEvents["AuthSelect"].emit(data);
    }

    public authSelectResult(result: AuthSelectResult) {
        this.authEvents["AuthSelectResult"].emit(result);
    }

    public on(event: AuthEventType, callback: (data: any) => void) {
        this.authEvents[event].subscribe(callback);
    }

    // Caches current authorization state to avoid reauthenticating failed
    // tenants without user request.
    private cacheAuthorization(authorization: TenantAuthorization):
        Observable<TenantAuthorization> {
        this.previousTenantState[authorization.tenant.tenantId] =
            authorization;
        return of(authorization);
    }

    private initializeEventEmitters() {
        this.authEvents["AuthSelect"] = new EventEmitter<AuthSelectRequest>();
        this.authEvents["AuthSelectResult"] = new EventEmitter<AuthSelectResult>();
        this.authEvents["AuthComplete"] = new EventEmitter();
        this.authEvents["Logout"] = new EventEmitter();
    }
}

class AuthFlowException extends Error {
    constructor(public authEvent: AuthEvent) {
        super(`Auth flow exception (${authEvent.type}): ${authEvent.message}`);
    }
}

function isAuthEvent(obj: any): obj is AuthEvent {
    return obj && (obj.type === "cancel" || obj.type === "signout");
}
