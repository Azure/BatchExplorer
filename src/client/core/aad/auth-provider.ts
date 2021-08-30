import {
    AccountInfo,
    AuthenticationResult,
    ClientApplication,
    PublicClientApplication
} from "@azure/msal-node";
import { log } from "@batch-flask/utils";
import { BatchExplorerApplication } from "..";
import { SecureDataStore } from "../secure-data-store";
import { AADConfig } from "./aad-config";
import { defaultTenant, TenantPlaceholders } from "./aad-constants";
import MSALCachePlugin from "./msal-cache-plugin";

const MSAL_SCOPES = ["user_impersonation"];

export type AuthorizationResult = AuthenticationResult;

/**
 * Provides authentication services
 */
export default class AuthProvider {
    private _clients: StringMap<ClientApplication> = {};
    private _accounts: StringMap<AccountInfo> = {};
    private _cachePlugin: MSALCachePlugin;
    private _logoutPromise?: Promise<void>;
    private _primaryClient?: ClientApplication;

    constructor(
        protected app: BatchExplorerApplication,
        protected config: AADConfig
    ) {
        this._cachePlugin =
            new MSALCachePlugin(app.injector.get(SecureDataStore));
    }

    /**
     * Retrieves an access token
     *
     * Will attempt to retrieve the token silently if an account exists in the
     * cache, but will fall back to interactive access token retrieval.
     *
     * @param authCodeCallback Handles interactive authentication code retrieval
     */
    public async getToken(options: {
        resourceURI: string,
        tenantId?: string,
        authCodeCallback: (url: string, silent?: boolean) => Promise<string>
    }): Promise<AuthorizationResult> {
        const { resourceURI, tenantId = defaultTenant, authCodeCallback } = options;

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
        const client = this._getClient(tenantId);

        const authRequest = this._authRequest(resourceURI, tenantId);
        try {
            log.debug(`Trying to silently acquire token for '${tenantId}'`);
            const account = await this._getAccount(tenantId);
            const result = await client.acquireTokenSilent({
                ...authRequest, account
            });
            return result;
        } catch (silentTokenException) {
            log.debug(`Trying silent auth code flow (${silentTokenException})`);
            let url, code;

            try {
                // Attempt to get authorization code silently
                url = await client.getAuthCodeUrl(
                    { ...authRequest, prompt: "none" }
                );
                code = await authCodeCallback(url, true);
            } catch (silentAuthException) {
                log.debug(`Trying interactive auth code flow (${silentAuthException})`);
                url = await client.getAuthCodeUrl(authRequest);
                code = await authCodeCallback(url);
            }

            const result: AuthorizationResult =
                await client.acquireTokenByCode({ ...authRequest, code });
            return result;
        }
    }

    public async logout(): Promise<void> {
        this._logoutPromise = this._removeAccounts();
        return this._logoutPromise;
    }

    private async _removeAccounts(): Promise<void> {
        const cache = this._primaryClient?.getTokenCache();
        if (!cache) {
            return;
        }
        const accounts = await cache.getAllAccounts();
        for (const account of accounts) {
            await cache.removeAccount(account);
        }
        this._accounts = {};
        this._clients = {};
        this._primaryClient = undefined;
    }

    protected _getClient(tenantId: string): ClientApplication {
        if (tenantId in this._clients) {
            return this._clients[tenantId];
        }
        const client = new PublicClientApplication({
            auth: {
                clientId: this.config.clientId,
                authority:
                    `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`
            },
            cache: {
                cachePlugin: this._cachePlugin
            }
        });
        if (!this._primaryClient) {
            this._primaryClient = client;
        }
        this._clients[tenantId] = client;
        return client;
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
            `Unable to find a valid AAD account for tenant ${tenantId}`
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

    private _authRequest(resourceURI: string, tenantId?: string) {
        return {
            scopes: this._getScopes(resourceURI),
            redirectUri: this.config.redirectUri,
            authority:
                `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`
        };
    }
}
