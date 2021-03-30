import {
    AccountInfo,
    AuthenticationResult,
    ClientApplication,
    Configuration,
    PublicClientApplication
 } from "@azure/msal-node";
import { MSALAccessTokenCache } from "app/services/aad/msal-token-cache";
import { BatchExplorerApplication } from "..";
import { AADConfig } from "./aad-config";

const MSAL_SCOPES = ["user_impersonation"];

/**
 * Provides authentication services
 */
export default class AuthProvider {
    private _client: ClientApplication;
    private _account: AccountInfo;
    private _scopes: string[];

    constructor(
        private app: BatchExplorerApplication,
        private config: AADConfig
    ) {
        const msalConfig: Configuration = {
            auth: {
                clientId: this.config.clientId,
                authority: this.app.properties.azureEnvironment.aadUrl +
                    this.config.tenant // URL already terminates with '/'
            },
            cache: {
                cachePlugin: new MSALAccessTokenCache()
            }
        };

        this._client = new PublicClientApplication(msalConfig);

        this._configureScopes();
    }

    /**
     * Retrieves an access token
     *
     * Will attempt to retrieve the token silently if an account exists in the
     * cache, but will fall back to interactive access token retrieval.
     *
     * @param authCodeCallback Handles interactive authentication code retrieval
     */
    public async getToken(authCodeCallback: (url: string) => Promise<string>):
    Promise<void> {
        if (this._account) {
            await this._client.acquireTokenSilent({
                account: this._account,
                scopes: this._scopes
            });
        } else {
            const url = await this._client.getAuthCodeUrl(this._authRequest());
            const authCode = await authCodeCallback(url);
            const result: AuthenticationResult =
                await this._client.acquireTokenByCode({
                    ...this._authRequest(),
                    code: authCode
                });
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

    private _configureScopes(): void {
        this._scopes = [];
        MSAL_SCOPES.forEach(scope => {
            this._scopes.push(`${this.app.properties.azureEnvironment.arm}/${scope}`);
            this._scopes.push(`${this.app.properties.azureEnvironment.batch}/${scope}`);
            this._scopes.push(`${this.app.properties.azureEnvironment.aadGraph}/${scope}`);
            this._scopes.push(`${this.app.properties.azureEnvironment.msGraph}/${scope}`);
            this._scopes.push(`${this.app.properties.azureEnvironment.appInsights}/${scope}`);
        });
    }

    private _authRequest() {
        return {
            scopes: this._scopes,
            redirectUri: this.config.redirectUri
        }
    }
}
