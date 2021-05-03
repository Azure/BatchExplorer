import {
    AccountInfo,
    AuthenticationResult,
    ClientApplication,
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
    private _clients: StringMap<ClientApplication> = {};
    private _account: AccountInfo;
    private _tokensFetched: StringMap<boolean> = {};

    constructor(
        private app: BatchExplorerApplication,
        private config: AADConfig
    ) {
        // Prime common tenant
        this._getClient(this.config.tenant);
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
        authCodeCallback: (url: string) => Promise<string>
    }): Promise<AuthorizationResult> {
        const { resourceURI, tenantId = "common", authCodeCallback } = options;
        const client = this._getClient(tenantId);
        const authRequest = this._authRequest(resourceURI, tenantId);
        if (this._account && this._tokensFetched[tenantId]) {
            const result = await client.acquireTokenSilent({
                ...authRequest,
                account: this._account
            });
            console.log(`
Silent
authority: ${authRequest.authority}
token: ...${result.accessToken.substring(result.accessToken.length - 6)}
            `);
            return result;
        } else {
            const url = await client.getAuthCodeUrl(authRequest);
            const code = await authCodeCallback(url);
            const result: AuthorizationResult =
                await client.acquireTokenByCode({ ...authRequest, code });
            if (result) {
                this._account = result.account;
                this._tokensFetched[tenantId] = true
            console.log(`
Interactive
authority: ${authRequest.authority}
token: ...${result.accessToken.substring(result.accessToken.length - 6)}
            `);
            }
            return result;
        }
    }

    public logout(): void {
        this._removeAccount();
    }

    private _getClient(tenantId: string): ClientApplication {
        if (tenantId in this._clients) {
            return this._clients[tenantId];
        }
        return this._clients[tenantId] = new PublicClientApplication({
            auth: {
                clientId: this.config.clientId,
                authority:
                    `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`
            }
        });
    }

    private async _removeAccount(): Promise<void> {
        for (const tenantId in this._clients) {
            if (this._account) {
                const cache = this._clients[tenantId].getTokenCache();
                cache.removeAccount(this._account);
            }
        }
        this._account = null;
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
                `${this.app.properties.azureEnvironment.aadUrl}${tenantId}/`,

            extraQueryParameters: {
                "instance_aware": "true"
            }
        };
    }
}
