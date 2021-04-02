import {
    AccountInfo,
    AuthenticationResult,
    ClientApplication,
    Configuration,
    PublicClientApplication
 } from "@azure/msal-node";
import { BatchExplorerApplication } from "..";
import { AADConfig } from "./aad-config";

const MSAL_SCOPES = [".default"];

export type AuthorizationResult = AuthenticationResult;

/**
 * Provides authentication services
 */
export default class AuthProvider {
    private _clients: StringMap<ClientApplication> = {};
    private _account: AccountInfo;

    constructor(
        private app: BatchExplorerApplication,
        private config: AADConfig
    ) {
        const msalConfig: Configuration = {
            auth: {
                clientId: this.config.clientId,
                authority: this.app.properties.azureEnvironment.aadUrl +
                    this.config.tenant // URL already terminates with '/'
            }
        };

        this._clients["common"] = new PublicClientApplication(msalConfig);
    }

    /**
     * Retrieves an access token
     *
     * Will attempt to retrieve the token silently if an account exists in the
     * cache, but will fall back to interactive access token retrieval.
     *
     * @param authCodeCallback Handles interactive authentication code retrieval
     */
    public async getToken(
        tenantId: string,
        resourceURI: string,
        authCodeCallback: (url: string) => Promise<string>
    ): Promise<AuthorizationResult> {
        tenantId = "common";
        const client = this._getClient(tenantId);
        if (this._account) {
            const scopes = this._getScopes(resourceURI);
            return await client.acquireTokenSilent({
                account: this._account,
                scopes
            });
        } else {
            const authRequest = this._authRequest(resourceURI);
            const url = await client.getAuthCodeUrl(authRequest);
            const authCode = await authCodeCallback(url);
            const request = {
                ...authRequest,
                code: authCode
            };
            const result: AuthorizationResult =
                await client.acquireTokenByCode(request);
            this._account = result.account;
            return result;
        }
    }

    private _getClient(tenantId: string) {
        if (tenantId in this._clients) {
            return this._clients[tenantId];
        }
        const msalConfig: Configuration = {
            auth: {
                clientId: this.config.clientId,
                authority: this.app.properties.azureEnvironment.aadUrl +
                    tenantId // URL already terminates with '/'
            }
        };

        this._clients[tenantId] = new PublicClientApplication(msalConfig);
        return this._clients[tenantId];
    }

    public logout(): void {
        this._removeAccount();
    }

    private async _removeAccount(): Promise<void> {
        if (this._account) {
            const cache = this._clients["common"].getTokenCache();
            cache.removeAccount(this._account);
            this._account = null;
        }
    }

    private _getScopes(resourceURI: string): string[] {
        if (resourceURI.startsWith(this.app.properties.azureEnvironment.arm)) {
            resourceURI += "/";
        }
        return MSAL_SCOPES.map(scope => `${resourceURI}${scope}`);
    }

    private _authRequest(resourceURI: string) {
        return {
            scopes: this._getScopes(resourceURI),
            redirectUri: this.config.redirectUri
        }
    }
}
