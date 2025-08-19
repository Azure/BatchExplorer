import {
    AccountInfo,
    AuthenticationResult,
    InteractiveRequest,
    PublicClientApplication,
} from "@azure/msal-node";
import { log } from "@batch-flask/utils";
import { BatchExplorerApplication } from "..";
import { SecureDataStore } from "../secure-data-store";
import { AADConfig } from "./aad-config";
import { defaultTenant, TenantPlaceholders } from "./aad-constants";
import MSALCachePlugin from "./msal-cache-plugin";
import { AuthObserver } from "./auth-observer";
import { shell } from "electron";
import { AuthLoopbackClient } from "./auth-loopback-client";
import { ProxyNetworkClient } from "./proxy-network-client";

import "global-agent/bootstrap";

const MSAL_SCOPES = ["user_impersonation"];

export type AuthorizationResult = AuthenticationResult;
interface MSALAuthRequest  {
    scopes: string[];
    redirectUri: string;
    authority: string;
}

/**
 * Provides authentication services
 */
export default class AuthProvider {
    private _clients: StringMap<PublicClientApplication> = {};
    private _accounts: StringMap<AccountInfo> = {};
    private _cachePlugin: MSALCachePlugin;
    private _logoutPromise?: Promise<void>;
    private _primaryClient?: PublicClientApplication;

    private authObserver: AuthObserver;

    // Used for reauthentication to associated tenants
    private _primaryUsername?: string;

    constructor(
        protected app: BatchExplorerApplication,
        protected config: AADConfig
    ) {
        this._cachePlugin =
            new MSALCachePlugin(app.injector.get(SecureDataStore));
    }

    public setAuthObserver(observer: AuthObserver) {
        this.authObserver = observer;
    }

    /**
     * Retrieves an access token for a tenant and resource
     *
     * Will attempt to retrieve the token silently if an account exists in the
     * cache, but will fall back to interactive access token retrieval.
     *
     * @param resourceURI: The resource URI for which to get an access token
     * @param tenantId: The tenant from which to get the token (defaults to the
     *     default tenant)
     * @param authCodeCallback Handles interactive authentication code retrieval
     */
    public async getToken(options: {
        resourceURI: string,
        tenantId?: string,
        forceRefresh?: boolean,
    }): Promise<AuthorizationResult> {
        const {
            resourceURI,
            tenantId = defaultTenant,
            forceRefresh = false,
        } = options;

        if (this._logoutPromise) {
            await this._logoutPromise;
        }

        /**
         * KLUDGE: msal.js does not handle well access tokens across multiple
         * tenants within the same cache. It lets you specify a different
         * authority per request but it returns the same access token.
         *
         * Until this is resolved, we use one client application per tenant.
         */
        const client = await this._getClient(tenantId);

        const authRequest = this._authRequest(resourceURI, tenantId);
        let account: AccountInfo | null = null;
        try {
            log.debug(`[${tenantId}] Trying to acquire token silently`);

            account = await this._getAccount(tenantId);
            if (!account) {
                throw new Error(
                    "[internal] No valid account found for silent auth"
                );
            }

            const result = await client.acquireTokenSilent({
                ...authRequest, account, forceRefresh
            });
            return result;
        } catch (silentTokenException) {
            log.debug(`[${tenantId}] Silent token acquisition failed: ${
                silentTokenException}`);

            // Prompt user for interactive authentication type
            const { externalBrowserAuth } =
                await this.authObserver.selectUserAuthMethod(tenantId);

            let result: AuthenticationResult;
            if (externalBrowserAuth) {
                log.debug(`[${tenantId}] Interactive auth code flow with ` +
                    `system browser (${silentTokenException})`);
                result = await this._systemBrowserAuth(client, authRequest,
                    tenantId);
            } else {
                log.debug(`[${tenantId}] Interactive auth code flow with ` +
                    `built-in window (${silentTokenException})`);
                result = await this._builtInWindowAuth(client, authRequest,
                    tenantId);
            }

            if (result?.account) {
                this._accounts[tenantId] = result.account;
                if (!this._primaryUsername) {
                    this._primaryUsername = result.account.username;
                }
            } else {
                log.warn("Authentication result did not contain account information");
            }

            return result;
        }
    }

    private async _systemBrowserAuth(
        client: PublicClientApplication,
        authRequest: MSALAuthRequest,
        tenantId: string
    ): Promise<AuthorizationResult> {
        try {
            const interactiveRequest =
                await this._createExternalBrowserRequest(authRequest);
            return await client.acquireTokenInteractive(interactiveRequest);
        } catch (error) {
            log.warn(`[${tenantId}] Failed to authenticate with browser: ${error}`);
            this.authObserver.onAuthFailure(error);
            throw error;
        }
    }

    private async _builtInWindowAuth(
        client: PublicClientApplication,
        authRequest: MSALAuthRequest,
        tenantId: string,
    ) {
        let code: string;
        let url: string;
        try {
            url = await client.getAuthCodeUrl({
                ...authRequest,
                domainHint: tenantId,
                loginHint: this._primaryUsername
            });
        } catch (error) {
            log.warn(`[${tenantId}] Failed to get auth code URL: ${error}`);
            this.authObserver.onAuthFailure(error);
            throw error;
        }

        try {
            code = await this.authObserver.fetchAuthCode(url, tenantId);
        } catch (error) {
            log.warn(`[${tenantId}] Failed to authenticate with built-in window: ${error}`);
            this.authObserver.onAuthFailure(error);
            throw error;
        }

        const result = await client.acquireTokenByCode({ ...authRequest, code });
        return result;
    }

    private async _createExternalBrowserRequest(authRequest: MSALAuthRequest):
        Promise<InteractiveRequest> {
        const loopbackClient = await AuthLoopbackClient.initialize(3874);

        // opens a browser instance via Electron shell API
        const openBrowser = async (url: string) => {
            await shell.openExternal(url);
        };
        const interactiveRequest: InteractiveRequest = {
            ...authRequest,
            openBrowser,
            loopbackClient,
            prompt: "select_account"
        };
        return interactiveRequest;
    }

    public async logout(tenantId?: string): Promise<void> {
        this._logoutPromise = this._removeAccounts(tenantId);
        return this._logoutPromise;
    }

    private async _removeAccounts(tenantId?: string): Promise<void> {
        const cache = this._primaryClient?.getTokenCache();
        if (!cache) {
            return;
        }
        const accounts = await cache.getAllAccounts();
        if (tenantId) {
            for (const account of accounts) {
                if (account.tenantId === tenantId) {
                    await cache.removeAccount(account);
                    break;
                }
            }
            delete this._accounts[tenantId];
        } else {
            for (const account of accounts) {
                await cache.removeAccount(account);
            }
            this._accounts = {};
            this._clients = {};
            this._primaryClient = undefined;
            this._primaryUsername = undefined;
        }
    }

    protected async _getClient(tenantId: string):
        Promise<PublicClientApplication> {
        if (tenantId in this._clients) {
            return this._clients[tenantId];
        }
        const client = await this._createClient(tenantId);
        if (!this._primaryClient) {
            this._primaryClient = client;
        }
        this._clients[tenantId] = client;
        return client;
    }

    private async _createClient(tenantId: string):
        Promise<PublicClientApplication> {
        const proxyUrl = await this._loadProxyUrl();
        let networkClient;

        if (proxyUrl) {
            log.info(`[${tenantId}] Proxying auth endpoints through ` +
                proxyUrl);
            process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl;
            networkClient = new ProxyNetworkClient(proxyUrl);
        }

        const authority =
            `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`;

        return new PublicClientApplication({
            system: {
                networkClient
            },
            auth: {
                clientId: this.config.clientId,
                authority,
                knownAuthorities: [authority]
            },
            cache: {
                cachePlugin: this._cachePlugin
            }
        });
    }

    private async _loadProxyUrl() {
        const proxySettings = await this.app.proxySettings.settings;
        const protocolUrl = proxySettings?.https ?? proxySettings?.http;
        return protocolUrl?.toString();
    }

    private async _getAccount(tenantId: string): Promise<AccountInfo> {
        if (tenantId in this._accounts) {
            return this._accounts[tenantId];
        }
        const cache = this._clients[tenantId].getTokenCache();
        const accounts: AccountInfo[] = await cache.getAllAccounts();
        let homeAccountId = null;
        for (const account of accounts) {
            if (account.tenantId === tenantId) {
                return this._accounts[tenantId] = account;
            } else if (!homeAccountId) {
                homeAccountId = account.homeAccountId;
            }
        }

        /* SPECIAL CASE: If the tenant is one of the tenant placeholders (e.g.,
         * "common"), fallback to the home tenant account, since the tenant in
         * the account dictionary are always resolved IDs.
         */
        if (tenantId in TenantPlaceholders) {
            return this._accounts[tenantId] =
                await cache.getAccountByHomeId(homeAccountId);
        }

        throw new Error(
            `Unable to find a valid account for tenant ${tenantId}`
        );
    }

    private _getScopes(resourceURI: string): string[] {
        switch (resourceURI) {
            case this.app.properties.azureEnvironment.arm:
            case this.app.properties.azureEnvironment.batch:
                return MSAL_SCOPES.map(s => `${resourceURI}/${s}`);
            default:
                return MSAL_SCOPES.map(s => `${resourceURI}${s}`);
        }
    }

    private _authRequest(resourceURI: string, tenantId?: string): MSALAuthRequest {
        return {
            scopes: this._getScopes(resourceURI),
            redirectUri: this.config.redirectUri,
            authority:
                `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`
        };
    }
}
