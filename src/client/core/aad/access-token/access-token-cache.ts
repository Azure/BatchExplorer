// import { Constants } from "app/utils";
import { AccessToken } from "./access-token.model";

/**
 * Hellper class to storage the access tokens in memory and in the localstorage.
 */
export class AccessTokenCache {
    private _tokens: any = {};

    public init() {
        this._loadFromStorage();
    }

    public hasToken(tenantId: string, resource: string) {
        return tenantId in this._tokens && resource in this._tokens[tenantId];
    }

    public getToken(tenantId: string, resource: string) {
        const tenantTokens = this._tokens[tenantId];
        return tenantTokens && tenantTokens[resource];
    }

    public storeToken(tenantId: string, resource: string, token: AccessToken) {
        if (!(tenantId in this._tokens)) {
            this._tokens[tenantId] = {};
        }
        this._tokens[tenantId][resource] = token;
        this._saveToStorage();
    }

    public removeToken(tenantId: string, resource: string) {
        const tenantTokens = this._tokens[tenantId];
        if (tenantTokens) {
            delete tenantTokens[resource];
        }
    }

    public clear() {
        this._tokens = {};
        // localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
    }

    private _saveToStorage() {
        const tokens = {};
        for (const tenantId of Object.keys(this._tokens)) {
            tokens[tenantId] = {};
            for (const resource of Object.keys(this._tokens[tenantId])) {
                tokens[tenantId][resource] = this._tokens[tenantId][resource].toJS();
            }
        }
        // localStorage.setItem(Constants.localStorageKey.currentAccessToken, JSON.stringify(tokens));
    }

    private _loadFromStorage() {
        // const tokenStr = localStorage.getItem(Constants.localStorageKey.currentAccessToken);
        // if (!tokenStr) {
        //     return;
        // }
        // try {
        //     const data = JSON.parse(tokenStr);
        //     const tokens = this._processSerializedTokens(data);
        //     if (Object.keys(tokens).length === 0) {
        //         localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        //     } else {
        //         this._tokens = tokens;
        //     }
        // } catch (e) {
        //     localStorage.removeItem(Constants.localStorageKey.currentAccessToken);
        // }
    }

    private _processSerializedTokens(data: any) {
        const tokens = {};
        for (let tenantId of Object.keys(data)) {
            const tenant = data[tenantId];
            if (!tenant || typeof tenant !== "object") {
                continue;
            }

            for (let resource of Object.keys(tenant)) {
                if (!AccessToken.isValidToken(tenant[resource])) {
                    continue;
                }
                const token = new AccessToken(tenant[resource]);
                if (!token.hasExpired()) {
                    if (!(tenantId in tokens)) {
                        tokens[tenantId] = {};
                    }
                    tokens[tenantId][resource] = token;
                }
            }
        }
        return tokens;
    }
}
