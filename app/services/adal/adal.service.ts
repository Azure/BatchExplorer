import { Injectable, NgZone } from "@angular/core";
import { Http, Response } from "@angular/http";
import { remote } from "electron";
import * as moment from "moment";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { AADUser } from "app/models";
import { Constants, log } from "app/utils";
import { AccessToken } from "./access-token";
import { AccessTokenError, AccessTokenErrorResult, AccessTokenService } from "./access-token.service";
import { AdalConfig } from "./adal-config";
import { AuthorizeResult, UserAuthorization } from "./user-authorization";
import { UserDecoder } from "./user-decoder";

export interface AuthorizationResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

const defaultResource = "https://management.core.windows.net/";

@Injectable()
export class AdalService {
    /**
     * Minimum number of milliseconds the token should have left before we refresh
     * 2 minutes
     */
    public static refreshMargin = 1000 * 120;

    public currentUser: Observable<AADUser>;

    private _config: AdalConfig;
    private _userAuthorization: UserAuthorization;
    private _accessTokenService: AccessTokenService;
    private _userDecoder: UserDecoder;
    private _newAccessTokenSubject: StringMap<AsyncSubject<any>> = {};

    private _currentAccessTokens: StringMap<AccessToken> = {};

    private _currentUser = new BehaviorSubject<AADUser>(null);

    constructor(private http: Http, private zone: NgZone) {
        this._userDecoder = new UserDecoder();
        this.currentUser = this._currentUser.asObservable();
    }

    public init(config: AdalConfig) {
        this._config = config;
        this._userAuthorization = new UserAuthorization(config);
        this._accessTokenService = new AccessTokenService(config, this.http);
        this._retrieveUserFromLocalStorage();
        // this._retrieveAccessTokenFromLocalStorage();
        if (this._currentUser.getValue()) {
            if (!remote.getCurrentWindow().isVisible()) {
                remote.getCurrentWindow().show();
            }
        }
    }

    public login(): Observable<any> {
        if (this._currentUser.getValue()) {
            return Observable.of({});
        }
        const obs = this._retrieveNewAccessToken(defaultResource);
        obs.subscribe({
            next: () => {
                if (!remote.getCurrentWindow().isVisible()) {
                    remote.getCurrentWindow().show();
                }
            },
            error: () => {
                log.error("Error login");
            },
        });
        return obs;
    }

    public logout(): void {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);

        if (remote.getCurrentWindow().isVisible()) {
            remote.getCurrentWindow().hide();
        }
        this._currentAccessTokens = {};
        this._currentUser.next(null);
        this._userAuthorization.logout();
    }

    public get accessToken(): Observable<string> {
        return this.accessTokenFor();
    }

    public accessTokenFor(resource: string = defaultResource) {
        return this.accessTokenData(resource).map(x => x.access_token);
    }

    public accessTokenData(resource: string = defaultResource): Observable<AccessToken> {
        if (resource in this._currentAccessTokens) {
            const token = this._currentAccessTokens[resource];
            const expireIn = moment(token.expires_on).diff(moment());
            if (expireIn > AdalService.refreshMargin) {
                return Observable.of(token);
            }
        }

        return this._retrieveNewAccessToken(resource);
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
     * Look into the local storage to see if there is still an access token
     */
    private _retrieveAccessTokenFromLocalStorage() {
        const tokenStr = localStorage.getItem(Constants.localStorageKey.currentAccessToken);
        if (!tokenStr) {
            return;
        }
        try {
            const data = JSON.parse(tokenStr);
            const tokens = this._processSerializedTokens(data);
            if (Object.keys(tokens).length === 0) {
                localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
            } else {
                this._currentAccessTokens = tokens;
            }
        } catch (e) {
            localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        }
    }

    private _processSerializedTokens(data: any): StringMap<AccessToken> {
        const tokens = {};
        for (let resource of Object.keys(data)) {
            if (!AccessToken.isValidToken(data[resource])) {
                continue;
            }
            const token = new AccessToken(data[resource]);
            if (!token.hasExpired()) {
                tokens[resource] = token;
            }
        }
        return tokens;
    }
    /**
     * Retrieve a new access token using the refresh token if available or authorize the user and use authorization code
     * Will set the currentAccesToken.
     * @return Observable with access token object
     */
    private _retrieveNewAccessToken(resource: string): Observable<AccessToken> {
        if (resource in this._currentAccessTokens && this._currentAccessTokens[resource].refresh_token) {
            return this._useRefreshToken(resource, this._currentAccessTokens[resource].refresh_token);
        }

        if (resource in this._newAccessTokenSubject) {
            return this._newAccessTokenSubject[resource].asObservable();
        }

        const subject = this._newAccessTokenSubject[resource] = new AsyncSubject();
        this._redeemNewAccessToken(resource);
        return subject;
    }

    /**
     * Load a new access token from the authorization code given at login
     */
    private _redeemNewAccessToken(resource: string, forceReLogin = false) {
        this._authorizeUser(forceReLogin)
            .do((result) => this._processUserToken(result.id_token))
            .flatMap((result: AuthorizeResult) => {
                return this._accessTokenService.redeem(resource, result.code);
            })
            .subscribe({
                next: (token) => {
                    this.zone.run(() => this._processAccessToken(resource, token));
                },
                error: (e: Response) => {
                    log.error("Error redeem auth code for token", e);
                    this._processAccessTokenError(resource, e);
                },
            });
    }

    private _authorizeUser(forceReLogin) {
        if (forceReLogin) {
            return this._userAuthorization.authorize(false);
        } else {
            return this._userAuthorization.authorizeTrySilentFirst();
        }
    }

    private _useRefreshToken(resource: string, refreshToken: string) {
        const obs = this._accessTokenService.refresh(resource, refreshToken);
        obs.subscribe({
            next: (token) => {
                this._processAccessToken(resource, token);
            },
            error: (error) => {
                log.error("Error refreshing token");
            },
        });
        return obs;
    }

    /**
     * Process IDToken return by the /authorize url to extract user information
     */
    private _processUserToken(idToken: string) {
        const user = this._userDecoder.decode(idToken);
        this._currentUser.next(user);
        localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(user));
    }

    private _processAccessToken(resource: string, token: AccessToken) {
        this._currentAccessTokens[resource] = token;
        localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(this._currentAccessTokens));

        // Notify
        const subject = this._newAccessTokenSubject[resource];
        delete this._newAccessTokenSubject[resource];
        subject.next(token);
        subject.complete();
    }

    private _processAccessTokenError(resource: string, error: Response) {
        const data: AccessTokenErrorResult = error.json();
        if (data.error === AccessTokenError.invalid_grant) {
            this._redeemNewAccessToken(resource, true);
        }

        const subject = this._newAccessTokenSubject[resource];
        delete this._newAccessTokenSubject[resource];
        subject.error(error);
    }
}
