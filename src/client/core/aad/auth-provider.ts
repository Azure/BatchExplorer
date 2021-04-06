import {
    AccountInfo,
    AuthenticationResult,
    ClientApplication,
    Configuration,
    PublicClientApplication
 } from "@azure/msal-node";
import { BatchExplorerApplication } from "..";
import { AADConfig } from "./aad-config";

const MSAL_SCOPES = ["user_impersonation"];

export type AuthorizationResult = AuthenticationResult;

/**
 * Provides authentication services
 */
export default class AuthProvider {
    private _client: ClientApplication;
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

        this._client = new PublicClientApplication(msalConfig);
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
        resourceURI: string,
        authCodeCallback: (url: string) => Promise<string>
    ): Promise<AuthorizationResult> {
        if (this._account) {
            const scopes = this._getScopes(resourceURI);
            return await this._client.acquireTokenSilent({
                account: this._account,
                scopes
            });
        } else {
            const authRequest = this._authRequest(resourceURI);
            const url = await this._client.getAuthCodeUrl(authRequest);
            const authCode = await authCodeCallback(url);
            const request = {
                ...authRequest,
                code: authCode
            };
            const result: AuthorizationResult =
                await this._client.acquireTokenByCode(request);
            this._account = result.account;
            return result;
        }
    }

    public logout(): void {
        this._removeAccount();
    }

    private async _removeAccount(): Promise<void> {
        if (this._account) {
            const cache = this._client.getTokenCache();
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
