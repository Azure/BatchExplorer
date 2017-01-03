import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { remote } from "electron";
import * as moment from "moment";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { ADUser } from "app/models";
import { Constants } from "app/utils";
import { AccessToken } from "./access-token";
import { AccessTokenService } from "./access-token.service";
import { AdalConfig } from "./adal-config";
import { AuthorizeResult, UserAuthorization } from "./user-authorization";
import { UserDecoder } from "./user-decoder";

export interface AuthorizationResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

@Injectable()
export class AdalService {
    /**
     * Minimum number of milliseconds the token should have left before we refresh
     * 2 minutes
     */
    public static refreshMargin = 1000 * 120;

    public currentUser: Observable<ADUser>;

    private _config: AdalConfig;
    private _authorizeUser: UserAuthorization;
    private _accessTokenService: AccessTokenService;
    private _userDecoder: UserDecoder;

    private _currentAccessToken: AccessToken = null;

    private _currentUser = new BehaviorSubject<ADUser>(null);

    constructor(private http: Http) {
        this._userDecoder = new UserDecoder();
        this.currentUser = this._currentUser.asObservable();
    }

    public init(config: AdalConfig) {
        this._config = config;
        this._authorizeUser = new UserAuthorization(config);
        this._accessTokenService = new AccessTokenService(config, this.http);
        this._retrieveUserFromLocalStorage();
        this._retrieveAccessTokenFromLocalStorage();
    }

    public login(): Observable<any> {
        const obs = this._retrieveNewAccessToken();
        obs.subscribe({
            next: () => {
                if (!remote.getCurrentWindow().isVisible()) {
                    remote.getCurrentWindow().show();
                }
            },
            error: () => {
                console.error("Error login");
            },
        });
        return obs;
    }

    public logout(): void {
        if (remote.getCurrentWindow().isVisible()) {
            remote.getCurrentWindow().hide();
        }
        this._currentAccessToken = null;
        this._authorizeUser.logout();
    }

    public get accessToken(): Observable<string> {
        return this.accessTokenData.map(x => x.access_token);
    }

    public get accessTokenData(): Observable<AccessToken> {
        if (this._currentAccessToken) {
            const expireIn = moment(this._currentAccessToken.expires_on).diff(moment());
            if (expireIn > AdalService.refreshMargin) {
                return Observable.of(this._currentAccessToken);
            }
        }

        return this._retrieveNewAccessToken();
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
        if (tokenStr) {
            try {
                const token = new AccessToken(JSON.parse(tokenStr));
                if (token.hasExpired()) {
                    localStorage.removeItem(Constants.localStorageKey.currentUser);
                } else {
                    this._currentAccessToken = token;
                }
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
    private _retrieveNewAccessToken(): Observable<AccessToken> {
        if (this._currentAccessToken && this._currentAccessToken.refresh_token) {
            return this._useRefreshToken(this._currentAccessToken.refresh_token);
        }
        const subject = new AsyncSubject();
        this._authorizeUser.authorizeTrySilentFirst().subscribe({
            next: (result: AuthorizeResult) => {
                this._processUserToken(result.id_token);
                this._accessTokenService.redeem(result.code).subscribe((token) => {
                    this._processAccessToken(token);
                    subject.next(token);
                    subject.complete();
                });
            },
            error: (error) => {
                console.error("Error auth", error);
            },
        });
        return subject.asObservable();
    }

    private _useRefreshToken(refreshToken: string) {
        const obs = this._accessTokenService.refresh(refreshToken);
        obs.subscribe({
            next: (token) => {
                this._processAccessToken(token);
            },
            error: (error) => {
                console.error("Error refreshing token");
            },
        });
        return obs;
    }

    // DEMO to check the AAD token is working. TODO remove
    private _listSub(token: string) {
        const url = `https://management.azure.com/subscriptions?api-version=2016-06-01`;
        const headers = new Headers({ Authorization: `Bearer ${token}` });
        const options = new RequestOptions({ headers });
        this.http.get(url, options).subscribe({
            next: (out) => {
                console.log("Subs are", out.json());
            },
            error: (error) => { console.log("Error for get sub is", error); },
        });
    }

    /**
     * Process IDToken return by the /authorize url to extract user information
     */
    private _processUserToken(idToken: string) {
        const user = this._userDecoder.decode(idToken);
        this._currentUser.next(user);
        localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(user));
    }

    private _processAccessToken(token: AccessToken) {
        this._currentAccessToken = token;
        localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(token));
        // this._listSub(token.access_token); // TODO remove - just for testing token is working
    }
}
