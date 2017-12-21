
import { BatchLabsApplication } from "client/core";
import { localStorage } from "client/core/local-storage";
import { logger } from "client/logger";
import { Constants } from "common";
import { Deferred } from "common/deferred";
import fetch from "node-fetch";
import { BehaviorSubject, Observable } from "rxjs";
import { AADConfig } from "../aad-config";
import {
    AccessToken, AccessTokenCache,
    AccessTokenError, AccessTokenErrorResult, AccessTokenService,
} from "../access-token";
import { AuthenticationService, AuthorizeResult } from "../authentication";
import { AADUser } from "./aad-user";
import { UserDecoder } from "./user-decoder";

const resources = [
    Constants.ResourceUrl.arm,
    Constants.ResourceUrl.batch,
];

const adalConfig: AADConfig = {
    tenant: "common",
    clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Azure CLI
    redirectUri: "urn:ietf:wg:oauth:2.0:oob",
};

const defaultResource = Constants.AAD.defaultResource;

export class AADService {
    public currentUser: Observable<AADUser>;

    public tenantsIds: Observable<string[]>;

    private _userAuthorization: AuthenticationService;
    private _accessTokenService: AccessTokenService;
    private _userDecoder: UserDecoder;
    private _newAccessTokenSubject: StringMap<Deferred<AccessToken>> = {};

    private _tokenCache = new AccessTokenCache(localStorage);

    private _currentUser = new BehaviorSubject<AADUser>(null);
    private _tenantsIds = new BehaviorSubject<string[]>([]);

    constructor(private app: BatchLabsApplication) {
        this._userDecoder = new UserDecoder();
        this.currentUser = this._currentUser.asObservable();
        this.tenantsIds = this._tenantsIds.asObservable();
        this._userAuthorization = new AuthenticationService(this.app, adalConfig);
        this._accessTokenService = new AccessTokenService(adalConfig);
    }

    public async init() {
        await Promise.all([
            this._retrieveUserFromLocalStorage(),
            this._tokenCache.init(),
        ]);
    }

    /**
     * Login to azure active directory.
     * This will retrieve fresh tokens for all tenant and resources needed by BatchLabs.
     * It will try to use the refresh token cached to prevent a new prompt window if possible.
     */
    public async login(): Promise<any> {
        this.app.splashScreen.updateMessage("Login to azure active directory");
        try {
            const tenantIds = await this._loadTenantIds();

            this.app.splashScreen.updateMessage("Retrieving access tokens");

            this._tenantsIds.next(tenantIds);
            for (let tenantId of tenantIds) {
                for (let resource of resources) {
                    await this._retrieveNewAccessToken(tenantId, resource);
                }
            }
            this._showMainWindow();
        } catch (error) {
            logger.error("Error login", error);
        }
    }

    public logout(): void {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);

        if (this.app.mainWindow.isVisible()) {
            this.app.mainWindow.hide();
        }
        this._tokenCache.clear();
        this._currentUser.next(null);
        this._clearUserSpecificCache();
        this._userAuthorization.logout();
    }

    public async accessTokenFor(tenantId: string, resource: string = defaultResource) {
        return this.accessTokenData(tenantId, resource).then(x => x.access_token);
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public async accessTokenData(tenantId: string, resource: string = defaultResource): Promise<AccessToken> {
        logger.debug(`"Accesstokendata ${tenantId}, ${resource}`);
        if (this._tokenCache.hasToken(tenantId, resource)) {
            logger.debug(`"Accesstokendata has token`);

            const token = this._tokenCache.getToken(tenantId, resource);
            if (!token.expireInLess(Constants.AAD.refreshMargin)) {
                return token;
            }
        }

        return this._retrieveNewAccessToken(tenantId, resource);
    }

    /**
     * Look into the localStorage to see if there is a user to be loaded
     */
    private async _retrieveUserFromLocalStorage() {
        const userStr = await localStorage.getItem(Constants.localStorageKey.currentUser);
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
    private async _retrieveNewAccessToken(tenantId: string, resource: string): Promise<AccessToken> {
        const token = this._tokenCache.getToken(tenantId, resource);
        if (token && token.refresh_token) {
            return this._useRefreshToken(tenantId, resource, token.refresh_token);
        }

        if (resource in this._newAccessTokenSubject) {
            return this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)].promise;
        }

        const defer = new Deferred<AccessToken>();
        this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)] = defer;
        this._redeemNewAccessToken(tenantId, resource);
        return defer.promise;
    }

    private _tenantResourceKey(tenantId: string, resource: string) {
        return `${tenantId}|${resource}`;
    }

    /**
     * Load a new access token from the authorization code given at login
     */
    private async _redeemNewAccessToken(tenantId: string, resource: string, forceReLogin = false) {
        const defer = this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];

        try {

            const result = await this._authorizeUser(tenantId, forceReLogin);
            this._processUserToken(result.id_token);
            const tid = tenantId === "common" ? this._currentUser.value.tid : tenantId;
            const token = await this._accessTokenService.redeem(resource, tid, result.code);
            this._processAccessToken(tenantId, resource, token);
            delete this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];
            defer.resolve(token);

        } catch (e) {
            logger.error(`Error redeem auth code for a token for resource ${resource}`, e);
            if (this._processAccessTokenError(tenantId, resource, e)) {
                return;
            }
            delete this._newAccessTokenSubject[this._tenantResourceKey(tenantId, resource)];
            defer.reject(e);
        }
    }

    private async _authorizeUser(tenantId, forceReLogin): Promise<AuthorizeResult> {
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
    private async _useRefreshToken(tenantId: string, resource: string, refreshToken: string): Promise<AccessToken> {
        try {
            const token = await this._accessTokenService.refresh(resource, tenantId, refreshToken);
            this._processAccessToken(tenantId, resource, token);
            return token;
        } catch (error) {
            logger.warn("Refresh token is not valid", error);
            this._tokenCache.removeToken(tenantId, resource);
            return this._retrieveNewAccessToken(tenantId, resource);
        }
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

    private async _processAccessTokenError(tenantId: string, resource: string, error: Response) {
        const data: AccessTokenErrorResult = await error.json();
        if (data.error === AccessTokenError.invalidGrant) {
            // TODO redeem a new token once(need to track number of failure)
            // this._redeemNewAccessToken(tenantId, resource, true);
        }
    }

    private async _loadTenantIds(): Promise<string[]> {
        const token = await this.accessTokenData("common");

        const headers = {
            Authorization: `${token.token_type} ${token.access_token}`,
        };
        const options = { headers };
        const url = `${Constants.ServiceUrl.arm}/tenants?api-version=${Constants.ApiVersion.arm}`;
        const response = await fetch(url, options);
        const { value } = await response.json();
        return value.map(x => x.tenantId);
    }

    private _clearUserSpecificCache() {
        localStorage.removeItem(Constants.localStorageKey.subscriptions);
        localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        localStorage.removeItem(Constants.localStorageKey.selectedAccountId);
    }

    private _showMainWindow() {
        logger.debug("SHow main window...");
        if (!this.app.mainWindow.isVisible()) {
            this.app.mainWindow.show();
        }
        this.app.splashScreen.destroy();
    }
}
