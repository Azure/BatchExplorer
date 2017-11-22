import { Injectable, NgZone } from "@angular/core";
import { Headers, Http, RequestOptions, Response } from "@angular/http";
import * as moment from "moment";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AADUser } from "app/models";
import { Constants, ObservableUtils, log } from "app/utils";
import { ElectronRemote } from "../electron";
import { AccessToken } from "./access-token";
import { AccessTokenError, AccessTokenErrorResult, AccessTokenService } from "./access-token.service";
import { AdalConfig } from "./adal-config";
import { TokenCache } from "./token-cache";
import { AuthorizeResult, UserAuthorization } from "./user-authorization";
import { UserDecoder } from "./user-decoder";

export interface AuthorizationResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

const resources = [
    Constants.ResourceUrl.arm,
    Constants.ResourceUrl.batch,
];

const defaultResource = resources[0];

@Injectable()
export class AdalService {
    /**
     * Minimum number of milliseconds the token should have left before we refresh
     * 2 minutes
     */
    public static refreshMargin = 1000 * 120;

    public currentUser: Observable<AADUser>;

    public tenantsIds: Observable<string[]>;

    private _userAuthorization: UserAuthorization;
    private _accessTokenService: AccessTokenService;
    private _userDecoder: UserDecoder;
    private _newAccessTokenSubject: StringMap<AsyncSubject<any>> = {};

    private _tokenCache = new TokenCache();

    private _currentUser = new BehaviorSubject<AADUser>(null);
    private _tenantsIds = new BehaviorSubject<string[]>([]);

    constructor(private http: Http, private zone: NgZone, private remote: ElectronRemote) {
        this._userDecoder = new UserDecoder();
        this.currentUser = this._currentUser.asObservable();
        this.tenantsIds = this._tenantsIds.asObservable();
    }

    public init(config: AdalConfig) {
        this._userAuthorization = new UserAuthorization(config, this.remote);
        this._accessTokenService = new AccessTokenService(config, this.http);
        this._retrieveUserFromLocalStorage();
        this._tokenCache.init();
        if (this._currentUser.value) {
            this._showMainWindow();
        }
    }

    public login(): Observable<any> {
        this.remote.getSplashScreen().updateMessage("Login to azure active directory");
        const obs = this._loadTenantIds().flatMap((ids) => {
            this.remote.getSplashScreen().updateMessage("Retrieving access tokens");

            this._tenantsIds.next(ids);
            const queries: Array<() => Observable<any>> = [];
            for (let tenantId of ids) {
                for (let resource of resources) {
                    queries.push(() => this._retrieveNewAccessToken(tenantId, resource));
                }
            }
            return ObservableUtils.queue(...queries);
        });
        obs.subscribe({
            next: () => {
                this._showMainWindow();
            },
            error: (error) => {
                log.error("Error login", error);
            },
        });
        return obs;
    }

    public logout(): void {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);

        if (this.remote.getCurrentWindow().isVisible()) {
            this.remote.getCurrentWindow().hide();
        }
        this._tokenCache.clear();
        this._currentUser.next(null);
        this._clearUserSpecificCache();
        this._userAuthorization.logout();
    }

    public accessTokenFor(tenantId: string, resource: string = defaultResource) {
        return this.accessTokenData(tenantId, resource).map(x => x.access_token);
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public accessTokenData(tenantId: string, resource: string = defaultResource): Observable<AccessToken> {
        if (this._tokenCache.hasToken(tenantId, resource)) {
            const token = this._tokenCache.getToken(tenantId, resource);

            const expireIn = moment(token.expires_on).diff(moment());
            if (expireIn > AdalService.refreshMargin) {
                return Observable.of(token);
            }
        }

        return this._retrieveNewAccessToken(tenantId, resource);
    }
    /**
     * Look into the localStorage to see if there is a user to be loaded
     */
    private _retrieveUserFromLocalStorage() {
        const userStr = localStorage.getItem(Constants.localStorageKey.currentUser);
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this._currentUser.next(user);
            } catch (e) {
                localStorage.removeItem(Constants.localStorageKey.currentUser);
            }
        }

    }

    /**
     * Retrieve a new access token using the refresh token if available or authorize the user and use authorization code
     * Will set the currentAccesToken.
     * @return Observable with access token object
     */
    private _retrieveNewAccessToken(tenantId: string, resource: string): Observable<AccessToken> {
        const token = this._tokenCache.getToken(tenantId, resource);
        if (token && token.refresh_token) {
            return this._useRefreshToken(tenantId, resource, token.refresh_token);
        }

        if (resource in this._newAccessTokenSubject) {
            return this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)].asObservable();
        }

        const subject = this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)] = new AsyncSubject();
        this._redeemNewAccessToken(tenantId, resource);
        return subject;
    }

    private _tenantResourceKey(tenantId: string, resource: string) {
        return `${tenantId}|${resource}`;
    }

    /**
     * Load a new access token from the authorization code given at login
     */
    private _redeemNewAccessToken(tenantId: string, resource: string, forceReLogin = false) {
        const subject = this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];

        this._authorizeUser(tenantId, forceReLogin)
            .do((result) => this._processUserToken(result.id_token))
            .flatMap((result: AuthorizeResult) => {
                const tid = tenantId === "common" ? this._currentUser.value.tid : tenantId;
                return this._accessTokenService.redeem(resource, tid, result.code);
            })
            .subscribe({
                next: (token) => {
                    this.zone.run(() => {
                        this._processAccessToken(tenantId, resource, token);
                        delete this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];
                        subject.next(token);
                        subject.complete();
                    });
                },
                error: (e: Response) => {
                    log.error(`Error redeem auth code for a token for resource ${resource}`, e);
                    if (this._processAccessTokenError(tenantId, resource, e)) {
                        return;
                    }
                    delete this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];
                    subject.error(e);
                },
            });
    }

    private _authorizeUser(tenantId, forceReLogin) {
        if (forceReLogin) {
            return this._userAuthorization.authorize(tenantId, false);
        } else {
            return this._userAuthorization.authorizeTrySilentFirst(tenantId);
        }
    }

    /**
     * Use the refresh token to get a new access token
     * @param tenantId TenantId to access
     * @param resource Resource to access
     * @param refreshToken Refresh token
     */
    private _useRefreshToken(tenantId: string, resource: string, refreshToken: string) {
        const obs = this._accessTokenService.refresh(resource, tenantId, refreshToken).catch((error) => {
            log.warn("Refresh token is not valid", error);
            this._tokenCache.removeToken(tenantId, resource);
            return this._retrieveNewAccessToken(tenantId, resource);
        });
        obs.subscribe({
            next: (token) => {
                this._processAccessToken(tenantId, resource, token);
            },
            error: (error) => {
                log.error("Error refreshing token", error);
            },
        });
        return obs;
    }

    /**
     * Process IDToken return by the /authorize url to extract user information
     */
    private _processUserToken(idToken: string) {
        const user = this._userDecoder.decode(idToken);
        const prevUser = this._currentUser.value;
        if (!prevUser || prevUser.unique_name !== user.unique_name) {
            this._clearUserSpecificCache();
        }
        this._currentUser.next(user);
        localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(user));
    }

    private _processAccessToken(tenantId: string, resource: string, token: AccessToken) {
        this._tokenCache.storeToken(tenantId, resource, token);
    }

    private _processAccessTokenError(tenantId: string, resource: string, error: Response) {
        const data: AccessTokenErrorResult = error.json();
        if (data.error === AccessTokenError.invalidGrant) {
            // TODO redeem a new token once(need to track number of failure)
            // this._redeemNewAccessToken(tenantId, resource, true);
        }
    }

    private _loadTenantIds(): Observable<string[]> {
        return this.accessTokenData("common").flatMap((token) => {
            const options = new RequestOptions();
            options.headers = new Headers();
            options.headers.append("Authorization", `${token.token_type} ${token.access_token}`);
            const url = `${Constants.ServiceUrl.arm}/tenants?api-version=${Constants.ApiVersion.arm}`;
            return this.http.get(url, options);
        }).map(response => {
            return response.json().value.map(x => x.tenantId);
        });
    }

    private _clearUserSpecificCache() {
        localStorage.removeItem(Constants.localStorageKey.subscriptions);
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        localStorage.removeItem(Constants.localStorageKey.selectedAccountId);
    }

    private _showMainWindow() {
        if (!this.remote.getCurrentWindow().isVisible()) {
            this.remote.getCurrentWindow().show();
        }
        this.remote.getSplashScreen().destroy();
    }
}
