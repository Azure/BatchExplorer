
import { Inject, Injectable, forwardRef } from "@angular/core";
import { AccessToken, DataStore, ServerError } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { TenantDetails } from "app/models";
import { AADResourceName, AzurePublic } from "client/azure-environment";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { BlIpcMain } from "client/core/bl-ipc-main";
import { fetch } from "client/core/fetch";
import { BatchExplorerProperties } from "client/core/properties";
import { TelemetryManager } from "client/core/telemetry";
import { Constants } from "common";
import { IpcEvent } from "common/constants";
import { Deferred } from "common/deferred";
import { dialog } from "electron";
import { BehaviorSubject, Observable } from "rxjs";
import { AADConfig } from "../aad-config";
import { defaultTenant } from "../aad-constants";
import AuthProvider from "../auth-provider";
import {
    AuthenticationService, AuthenticationState, AuthorizeResult, LogoutError
} from "../authentication";
import { AADUser } from "./aad-user";
import { UserDecoder } from "./user-decoder";

const aadConfig: AADConfig = {
    tenant: "common",
    clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Azure CLI
    redirectUri: "urn:ietf:wg:oauth:2.0:oob",
    logoutRedirectUri: "urn:ietf:wg:oauth:2.0:oob/logout",
};

@Injectable()
export class AADService {
    public currentUser: Observable<AADUser | null>;

    public tenants: Observable<TenantDetails[]>;

    public userAuthorization: AuthenticationService;
    public authenticationState: Observable<AuthenticationState | null>;

    private _authenticationState = new BehaviorSubject<AuthenticationState | null>(null);
    private _userDecoder: UserDecoder;
    private _newAccessTokenSubject: StringMap<Deferred<AccessToken>> = {};

    private _currentUser = new BehaviorSubject<AADUser | null>(null);
    private _tenants = new BehaviorSubject<TenantDetails[]>([]);

    constructor(
        @Inject(forwardRef(() => BatchExplorerApplication)) private app: BatchExplorerApplication,
        private localStorage: DataStore,
        private properties: BatchExplorerProperties,
        private telemetryManager: TelemetryManager,
        ipcMain: BlIpcMain
    ) {
        this._userDecoder = new UserDecoder();
        this.currentUser = this._currentUser.asObservable();
        this.tenants = this._tenants.asObservable();
        this.userAuthorization = new AuthenticationService(this.app, aadConfig,
            new AuthProvider(this.app, aadConfig), this);
        this.authenticationState = this._authenticationState.asObservable();

        ipcMain.on(IpcEvent.AAD.accessTokenData,
            async ({ tenantId, resource, forceRefresh }) =>
                await this.accessTokenData(tenantId, resource, forceRefresh));

        this.userAuthorization.state.subscribe((state) => {
            this._authenticationState.next(state);
        });
    }

    public async init() {
        await this._retrieveUserFromLocalStorage();
    }

    /**
     * Login to azure active directory.
     * This will retrieve fresh tokens for all tenant and resources needed by BatchExplorer.
     */
    public login(): { started: Promise<any>, done: Promise<any> } {
        const started = this._ensureTelemetryOptInNationalClouds();
        return {
            started,
            done: started.then(() => this._loginInCurrentCloud()),
        };
    }

    public async logout(closeWindows = true) {
        await this.localStorage.removeItem(Constants.localStorageKey.currentUser);
        this._tenants.next([]);
        await this._clearUserSpecificCache();
        for (const [, window] of this.app.windows) {
            window.webContents.session.clearStorageData({ storages: ["localStorage"] });
        }
        if (closeWindows) {
            this.app.windows.closeAll();
        }
        await this.userAuthorization.logout();
    }

    public async accessTokenFor(tenantId: string, resource?: AADResourceName) {
        return this.accessTokenData(tenantId, resource).then(x => x.accessToken);
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public async accessTokenData(
        tenantId: string, resource?: AADResourceName, forceRefresh = false
    ): Promise<AccessToken> {
        return this._retrieveNewAccessToken(tenantId, resource || "arm",
            forceRefresh);
    }

    private async _loginInCurrentCloud() {
        try {
            await this.accessTokenData(defaultTenant);
            this._authenticationState.next(AuthenticationState.Authenticated);
        } catch (error) {
            if (error instanceof LogoutError) {
                throw error;
            } else {
                log.error("Error login in ", error);
                throw error;
            }
        }
        try {
            const tenants = await this._loadTenants();

            this._tenants.next(tenants);
        } catch (error) {
            log.error("Error retrieving tenants", error);
            this._tenants.error(ServerError.fromARM(error));
        }
    }

    /**
     * Look into the localStorage to see if there is a user to be loaded
     */
    private async _retrieveUserFromLocalStorage() {
        const userStr = await this.localStorage.getItem<string>(Constants.localStorageKey.currentUser);
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this._currentUser.next(user);
            } catch (e) {
                this.localStorage.removeItem(Constants.localStorageKey.currentUser);
            }
        }
    }

    /**
     * Retrieve a new access token.
     * @return Observable with access token object
     */
    private async _retrieveNewAccessToken(
        tenantId: string, resource: AADResourceName, forceRefresh: boolean
    ): Promise<AccessToken> {
        const defer = new Deferred<AccessToken>();
        this._newAccessTokenSubject[
            this._tenantResourceKey(tenantId, resource)] = defer;
        this._redeemNewAccessToken(tenantId, resource, forceRefresh);
        return defer.promise;
    }

    private _tenantResourceKey(tenantId: string, resource: string) {
        return `${tenantId}|${resource}`;
    }

    /**
     * Load a new access token from the authorization code given at login
     */
    private async _redeemNewAccessToken(
        tenantId: string, resource: AADResourceName, forceRefresh: boolean
    ) {
        const subjectKey = this._tenantResourceKey(tenantId, resource);
        const defer = this._newAccessTokenSubject[subjectKey];
        delete this._newAccessTokenSubject[subjectKey];
        try {
            const result: AuthorizeResult =
                await this.userAuthorization.authorizeResource(
                    tenantId,
                    this.properties.azureEnvironment[resource as string],
                    forceRefresh
                );
            this._processUserToken(result.idToken);

            defer.resolve(new AccessToken({
                accessToken: result.accessToken,
                tokenType: result.tokenType,
                expiresOn: result.expiresOn,
                tenantId,
                homeTenantId: result.account?.homeAccountId?.split(".")[1],
                resource
            }));
        } catch (e) {
            log.error(`Error redeeming auth code for a token for resource ` +
                `${resource}: ${e}`);
            defer.reject(e);
        }
    }

    /**
     * Process IDToken return by the /authorize url to extract user information
     */
    private _processUserToken(idToken: string) {
        const user = this._userDecoder.decode(idToken);
        const prevUser = this._currentUser.value;
        if (!prevUser || prevUser.username !== user.username) {
            this._clearUserSpecificCache();
        }
        this._currentUser.next(user);
        this.localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(user));
    }

    private async _loadTenants(): Promise<TenantDetails[]> {
        const token = await this.accessTokenData(defaultTenant);

        const headers = {
            Authorization: `${token.tokenType} ${token.accessToken}`,
        };
        const options = { headers };
        const url = this._tenantURL();
        const response = await fetch(url, options);
        const { value } = await response.json();
        const tenants = value as TenantDetails[];
        tenants.forEach(tenant => tenant.homeTenantId = token.homeTenantId);
        return tenants;
    }

    private _tenantURL() {
        return this.properties.azureEnvironment.arm +
            `tenants?api-version=${Constants.ApiVersion.arm}`;
    }

    private async _clearUserSpecificCache() {
        this.localStorage.removeItem(Constants.localStorageKey.subscriptions);
        this.localStorage.removeItem(Constants.localStorageKey.selectedAccountId);
    }

    private async _ensureTelemetryOptInNationalClouds() {
        if (this.properties.azureEnvironment.id === AzurePublic.id) {
            return;
        }
        // If user hasn't picked a telemetry setting ask to opt in or out
        if (this.telemetryManager.userTelemetryEnabled == null) {
            const wikiLink = "https://github.com/Azure/BatchExplorer/wiki/Crash-reporting-and-telemetry";
            const val = await dialog.showMessageBox({
                type: "question",
                buttons: ["Enable", "Disable"],
                title: "Telemetry settings",
                message: "Batch Explorer collects anonymous usage data and sends it "
                    + "to Microsoft to help improve our products and services. "
                    + `You can learn more about what data is being sent and what it is used for at ${wikiLink}. `
                    + `You are login into a national cloud, do you wish to keep sending telemetry? `
                    + "Disabling will restart the application.",
                noLink: true,
            });

            if (val.response === 0) {
                return this.telemetryManager.enableTelemetry({ restart: false });
            } else if (val.response === 1) {
                return this.telemetryManager.disableTelemetry();
            }
        }
    }
}
